/**
 * Data store layer for User domain, abstracts away underlying datastore mechanism
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

import { UserStoreDynamoDB } from './user-store-dynamodb';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.DYNAMODB_TABLE_NAME || 'missing env var DYNAMODB_TABLE_NAME';

export interface User {
    username: string;
    fullName: string;
    email: string;
    address?: string;
}

export interface UserStore {
    createUser(user: User): Promise<void>;
    getUser(username: string): Promise<User>;
    updateUser(username: string, props: { fullName?: string; email?: string; address?: string }): Promise<void>;
}

export const userStore = new UserStoreDynamoDB({ ddbDocClient, tableName });
