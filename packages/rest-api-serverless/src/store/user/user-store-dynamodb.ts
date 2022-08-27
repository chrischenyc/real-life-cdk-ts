/**
 * Implementation of UserStore interface, uses DynamoDB as the underlying datastore mechanism
 */

import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import httpStatus from 'http-status';

import { APIError } from '../../common/api';
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
                    ConditionExpression: 'attribute_not_exists(PK) and attribute_not_exists(SK)',
                })
            );
        } catch (error) {
            if (error instanceof ConditionalCheckFailedException) {
                throw new APIError('username exists', httpStatus.BAD_REQUEST);
            }

            throw new APIError(`cannot create user. ${error}`, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getUser(username: string): Promise<User> {
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

            if (!Item) {
                throw new APIError('username not found', httpStatus.NOT_FOUND);
            }

            return {
                username,
                email: Item.email,
                fullName: Item.fullName,
                address: Item.address,
            };
        } catch (error) {
            if (error instanceof APIError) {
                throw error;
            }

            throw new APIError(`cannot find user: ${JSON.stringify(error)}`, httpStatus.INTERNAL_SERVER_ERROR);
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
                throw new APIError('username not found', httpStatus.NOT_FOUND);
            }

            throw new APIError(`cannot update user. ${error}`, httpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
