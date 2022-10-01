/**
 * AWS CDK Construct that provisions a DynamoDB table following single table design,
 * not because it's a sliver bullet, but because I'm lazy.
 */

import { RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from './base-construct';

type DynamoDBConstructProps = BaseConstructProps;

export class DynamoDBConstruct extends BaseConstruct {
    public readonly dynamodbTable: dynamodb.Table;
    public readonly reversedGSIName: string;

    constructor(scope: Construct, id: string, props: DynamoDBConstructProps) {
        super(scope, id, props);

        this.dynamodbTable = new dynamodb.Table(this, 'dynamodb-table', {
            tableName: this.stackName,
            partitionKey: {
                name: 'PK',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'SK',
                type: dynamodb.AttributeType.STRING,
            },
            pointInTimeRecovery: this.isProd,
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: this.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        });

        this.reversedGSIName = 'pk-sk-reversed';

        this.dynamodbTable.addGlobalSecondaryIndex({
            indexName: this.reversedGSIName,
            partitionKey: {
                name: 'SK',
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: 'PK',
                type: dynamodb.AttributeType.STRING,
            },
        });
    }
}
