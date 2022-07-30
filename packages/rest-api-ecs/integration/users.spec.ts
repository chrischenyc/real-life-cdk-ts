import axios from 'axios';
import randomstring from 'randomstring';

import { getDynamoDBItemWithRetry, removeDynamoDBItemsWithKeys } from './utils/dynamodb';

describe('users CRUD APIs', () => {
    const username = randomstring.generate(8);

    describe('POST /users', () => {
        test('should return error for an invalid payload', async () => {
            let response = await axios.post('/users', {
                username,
            });

            expect(response.status).toEqual(400);
            expect(response.data).toEqual(
                'Error validating request body. "fullName" is required. "email" is required.'
            );

            response = await axios.post('/users', {
                username,
                fullName: 'Integration Test',
            });

            expect(response.status).toEqual(400);
            expect(response.data).toEqual('Error validating request body. "email" is required.');

            response = await axios.post('/users', {
                username,
                email: 'test@example.com',
            });

            expect(response.status).toEqual(400);
            expect(response.data).toEqual('Error validating request body. "fullName" is required.');

            response = await axios.post('/users', {
                username,
                fullName: 'Integration Test',
                email: 'test@example.com',
                foo: 'bar',
            });

            expect(response.status).toEqual(400);
            expect(response.data).toEqual('Error validating request body. "foo" is not allowed.');
        });

        test('should create a new user with a valid payload', async () => {
            const { status } = await axios.post('/users', {
                username,
                fullName: 'Integration Test',
                email: 'test@example.com',
            });

            expect(status).toEqual(201);

            // test desired impact on downstream resources
            const dynamodbRecord = await getDynamoDBItemWithRetry({
                TableName: process.env.DYNAMODB_TABLE_NAME || 'missing env var DYNAMODB_TABLE_NAME',
                Key: {
                    PK: `USER#${username}`,
                    SK: `#PROFILE#${username}`,
                },
            });
            expect(dynamodbRecord).toMatchObject({
                PK: `USER#${username}`,
                SK: `#PROFILE#${username}`,
                email: 'test@example.com',
                fullName: 'Integration Test',
            });
        });
    });

    describe('PATCH /users/:username', () => {
        test('should return error for invalid username', async () => {
            const response = await axios.patch('/users/non-existent', {
                address: 'Mars',
            });

            expect(response.status).toEqual(501);
            expect(response.data).toEqual({ error: 'username not found' });
        });

        test('should update an existing user with a valid payload', async () => {
            const { status } = await axios.patch(`/users/${username}`, {
                address: 'Mars',
            });

            expect(status).toEqual(200);

            // test desired impact on downstream resources
            const dynamodbRecord = await getDynamoDBItemWithRetry({
                TableName: process.env.DYNAMODB_TABLE_NAME || 'missing env var DYNAMODB_TABLE_NAME',
                Key: {
                    PK: `USER#${username}`,
                    SK: `#PROFILE#${username}`,
                },
            });
            expect(dynamodbRecord).toMatchObject({
                PK: `USER#${username}`,
                SK: `#PROFILE#${username}`,
                email: 'test@example.com',
                fullName: 'Integration Test',
                address: 'Mars',
            });
        });
    });

    describe('GET /users/:username', () => {
        test('should return error for an invalid username', async () => {
            const response = await axios.get('/users/non-existent');

            expect(response.status).toEqual(404);
            expect(response.data).toEqual({ error: 'username non-existent not found' });
        });

        test('should find an existing user with a valid username', async () => {
            const { status, data } = await axios.get(`/users/${username}`);

            expect(status).toEqual(200);
            expect(data).toEqual({
                username,
                fullName: 'Integration Test',
                email: 'test@example.com',
                address: 'Mars',
            });
        });
    });

    afterAll(async () => {
        await removeDynamoDBItemsWithKeys({
            tableName: process.env.DYNAMODB_TABLE_NAME || 'missing env var DYNAMODB_TABLE_NAME',
            keys: [{ PK: `USER#${username}`, SK: `#PROFILE#${username}` }],
        });
    });
});
