import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'jest-aws-client-mock';

const ddbMock = mockClient(DynamoDBDocumentClient);

beforeEach(() => {
    ddbMock.mockReset();
});

test('dynamodbDocumentClient', async () => {
    const output: Partial<GetCommandOutput> = {
        Item: {
            Id: '4711',
        },
    };

    ddbMock.mockResolvedValue(output);

    const command = new GetCommand({
        TableName: 'tableName',
        Key: {
            Id: '4711',
        },
    });

    const dynamodbClient = new DynamoDBClient({});

    const ddb = DynamoDBDocumentClient.from(dynamodbClient);

    const result = await ddb.send(command);

    expect(ddbMock).toHaveBeenCalledTimes(1);
    expect(ddbMock).toHaveBeenCalledWith(command);
    expect(result).toEqual(output);
});
