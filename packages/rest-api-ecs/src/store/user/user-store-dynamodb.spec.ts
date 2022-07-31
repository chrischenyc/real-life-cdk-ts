import { ConditionalCheckFailedException, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import httpStatus from 'http-status';
import { mockClient } from 'jest-aws-client-mock';

import { APIError } from '../../common/api-error';
import { UserStoreDynamoDB } from './user-store-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);
const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = 'test-table';

describe('UserStoreDynamoDB', () => {
    const store = new UserStoreDynamoDB({
        ddbDocClient,
        tableName,
    });

    beforeEach(() => {
        ddbMock.mockReset();
    });

    describe('createUser(user)', () => {
        test('should try to write to DynamoDB with the given input', async () => {
            await store.createUser({
                username: 'unittest',
                email: 'test@example.com',
                fullName: 'Unit Test',
            });

            expect(ddbMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: {
                        TableName: tableName,
                        Item: {
                            PK: 'USER#unittest',
                            SK: '#PROFILE#unittest',
                            email: 'test@example.com',
                            fullName: 'Unit Test',
                        },
                        ConditionExpression: 'attribute_not_exists(PK) and attribute_not_exists(SK)',
                    },
                })
            );
        });

        test('should throw username exists error for ConditionalCheckFailedException', async () => {
            ddbMock.mockRejectedValue(new ConditionalCheckFailedException({ $metadata: {} }));

            await expect(
                store.createUser({
                    username: 'unittest',
                    email: 'test@example.com',
                    fullName: 'Unit Test',
                })
            ).rejects.toThrow(new APIError('username exists', httpStatus.BAD_REQUEST));
        });

        test('should throw other error as is', async () => {
            ddbMock.mockRejectedValue('some other error');

            await expect(
                store.createUser({
                    username: 'unittest',
                    email: 'test@example.com',
                    fullName: 'Unit Test',
                })
            ).rejects.toThrow(
                new APIError('cannot create user. Error: some other error', httpStatus.INTERNAL_SERVER_ERROR)
            );
        });
    });

    describe('getUser(username)', () => {
        test('should return if a DynamoDB item matches the given input', async () => {
            const output: Partial<GetCommandOutput> = {
                Item: {
                    PK: 'USER#unittest',
                    SK: '#PROFILE#unittest',
                    email: 'test@example.com',
                    fullName: 'Unit Test',
                    address: 'Mars',
                },
            };
            ddbMock.mockResolvedValue(output);

            const result = await store.getUser('unittest');

            expect(ddbMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: {
                        TableName: tableName,
                        Key: {
                            PK: 'USER#unittest',
                            SK: '#PROFILE#unittest',
                        },
                    },
                })
            );

            expect(result).toEqual({
                username: 'unittest',
                email: 'test@example.com',
                fullName: 'Unit Test',
                address: 'Mars',
            });
        });

        test('should throw not found error if no matching DynamoDB item', async () => {
            const output: Partial<GetCommandOutput> = {
                Item: undefined,
            };
            ddbMock.mockResolvedValue(output);

            await expect(store.getUser('unittest')).rejects.toThrow(
                new APIError('username not found', httpStatus.NOT_FOUND)
            );
        });
    });

    describe('updateUser(username, props)', () => {
        test('should try to update an existing DynamoDB item with the given input', async () => {
            await store.updateUser('unittest', {
                email: 'test2@example.com',
                address: 'Pluto',
            });

            expect(ddbMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    input: {
                        TableName: tableName,
                        Key: {
                            PK: 'USER#unittest',
                            SK: '#PROFILE#unittest',
                        },
                        ConditionExpression: 'attribute_exists(PK) and attribute_exists(SK)',
                        UpdateExpression: 'SET #email = :email, #address = :address',
                        ExpressionAttributeNames: {
                            '#email': 'email',
                            '#address': 'address',
                        },
                        ExpressionAttributeValues: {
                            ':email': 'test2@example.com',
                            ':address': 'Pluto',
                        },
                    },
                })
            );
        });

        test('should throw username not found error for ConditionalCheckFailedException', async () => {
            ddbMock.mockRejectedValue(new ConditionalCheckFailedException({ $metadata: {} }));

            await expect(
                store.updateUser('unittest', {
                    email: 'test2@example.com',
                })
            ).rejects.toThrow(new APIError('username not found', httpStatus.NOT_FOUND));
        });

        test('should throw other error as is', async () => {
            ddbMock.mockRejectedValue('some other error');

            await expect(
                store.updateUser('unittest', {
                    email: 'test2@example.com',
                })
            ).rejects.toThrow(
                new APIError('cannot update user. Error: some other error', httpStatus.INTERNAL_SERVER_ERROR)
            );
        });
    });
});
