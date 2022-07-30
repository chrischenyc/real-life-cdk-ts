import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    QueryCommand,
    QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { NativeAttributeValue } from '@aws-sdk/util-dynamodb';

const ddbDocClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_DEFAULT_REGION }));

/**
 * Get DynamoDB Item with automatic retries.
 * @param params AWS SDK @aws-sdk/lib-dynamodb/GetCommandInput
 * @param options retry config
 * @returns a DynamoDB item or undefined after max retries is reached
 */
export async function getDynamoDBItemWithRetry(
    params: GetCommandInput,
    options = { interval: 1000, maxRetries: 3 }
): Promise<Record<string, NativeAttributeValue> | undefined> {
    const { interval, maxRetries } = options;

    let retries = 0;

    while (retries <= maxRetries) {
        const { Item } = await ddbDocClient.send(new GetCommand(params));

        if (Item) {
            return Item;
        }

        await new Promise((r) => setTimeout(r, interval));
        retries++;
    }

    return undefined;
}

/**
 * Query DynamoDB Item with automatic retries.
 * @param params AWS SDK @aws-sdk/lib-dynamodb/GetCommandInput
 * @param options retry config
 * @returns a DynamoDB item or undefined after max retries is reached
 */
export async function queryDynamoDBItemsWithRetry(
    params: QueryCommandInput,
    options = { interval: 1000, maxRetries: 3 }
): Promise<Record<string, NativeAttributeValue>[] | undefined> {
    const { interval, maxRetries } = options;

    let retries = 0;

    while (retries <= maxRetries) {
        const { Items } = await ddbDocClient.send(new QueryCommand(params));

        if (Items) {
            return Items;
        }

        await new Promise((r) => setTimeout(r, interval));
        retries++;
    }

    return undefined;
}

/**
 * util function to clean up generated testing data.
 * it can be called in the afterEach or afterAll steps
 *
 * @param tableName
 * @param keys
 */
export async function removeDynamoDBItemsWithKeys(props: {
    tableName: string;
    keys: {
        [key: string]: NativeAttributeValue;
    }[];
}) {
    const { tableName, keys } = props;

    for (const key of keys) {
        await ddbDocClient.send(
            new DeleteCommand({
                TableName: tableName,
                Key: key,
            })
        );
    }
}
