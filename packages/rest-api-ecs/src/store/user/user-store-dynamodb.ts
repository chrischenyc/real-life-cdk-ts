/**
 * Implementation of UserStore interface, uses DynamoDB as the underlying datastore mechanism
 */

import { ConditionalCheckFailedException, DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { User, UserStore } from './user-store';

export class UserStoreDynamoDB implements UserStore {
    private readonly ddbDocClient: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(props: { ddbDocClient: DynamoDBDocumentClient; tableName: string }) {
        this.ddbDocClient = props.ddbDocClient;
        this.tableName = props.tableName;
    }

    async createUser(user: User): Promise<void> {
        try {
            const { username, ...rest } = user;
            await this.ddbDocClient.send(
                new PutCommand({
                    TableName: this.tableName,
                    Item: {
                        PK: `USER#${username}`,
                        SK: `#PROFILE#${username}`,
                        ...rest,
                    },
                })
            );
        } catch (error) {
            if (error instanceof ConditionalCheckFailedException) {
                throw 'username exists';
            }
            if (error instanceof DynamoDBServiceException) {
                throw error.message;
            }

            throw error;
        }
    }

    async getUser(username: string): Promise<User | undefined> {
        try {
            const { Item } = await this.ddbDocClient.send(
                new GetCommand({
                    TableName: this.tableName,
                    Key: {
                        PK: `USER#${username}`,
                        SK: `#PROFILE#${username}`,
                    },
                })
            );

            return (
                Item && {
                    username,
                    email: Item.email,
                    fullName: Item.fullName,
                    address: Item.address,
                }
            );
        } catch (error) {
            if (error instanceof DynamoDBServiceException) {
                throw error.message;
            }

            throw error;
        }
    }

    async updateUser(username: string, props: { fullName?: string; email?: string; address?: string }): Promise<void> {
        try {
            const keyValues = Object.entries(props);

            const updateCommand = new UpdateCommand({
                TableName: this.tableName,
                Key: {
                    PK: `USER#${username}`,
                    SK: `#PROFILE#${username}`,
                },
                ConditionExpression: 'attribute_exists(PK) and attribute_exists(SK)',
                UpdateExpression: `SET ${keyValues.map(([key, _value]) => `#${key} = :${key}`).join(', ')}`,
                ExpressionAttributeNames: keyValues.reduce(
                    (accumulator, [key, _value]) => ({
                        ...accumulator,
                        [`#${key}`]: key,
                    }),
                    {}
                ),
                ExpressionAttributeValues: keyValues.reduce((accumulator, [key, value]) => {
                    return {
                        ...accumulator,
                        [`:${key}`]: value,
                    };
                }, {}),
            });

            await this.ddbDocClient.send(updateCommand);
        } catch (error) {
            if (error instanceof ConditionalCheckFailedException) {
                throw 'username not found';
            }

            if (error instanceof DynamoDBServiceException) {
                throw error.message;
            }

            throw error;
        }
    }
}
