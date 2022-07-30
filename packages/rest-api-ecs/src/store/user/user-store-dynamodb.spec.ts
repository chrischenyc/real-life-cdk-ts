import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { UserStoreDynamoDB } from './user-store-dynamodb';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

describe('UserStoreDynamoDB', () => {
    const store = new UserStoreDynamoDB({
        ddbDocClient: ddbDocClient,
        tableName: 'test-table',
    });

    test('should first', () => {
        expect(true).toBeTruthy();
    });
});
