import { aws_lambda, aws_lambda_nodejs } from 'aws-cdk-lib';
import { JsonSchema, JsonSchemaType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from '../base-construct';

interface UsersApiConstructProps extends BaseConstructProps {
    readonly restApi: RestApi;
    readonly dynamodbTable: Table;
    readonly apiKeySecretName?: string;
}

export class UsersApiConstruct extends BaseConstruct {
    constructor(scope: Construct, id: string, props: UsersApiConstructProps) {
        super(scope, id, props);

        const { environment, restApi, dynamodbTable, apiKeySecretName } = props;

        const usersResource = restApi.root.addResource('users');

        // POST /users
        const createUserFunction = new aws_lambda_nodejs.NodejsFunction(this, 'create-user-function', {
            functionName: `${this.stackName}-user-create`,
            description: 'A function to create user record',
            entry: 'src/lambdas/users-create.ts',
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            environment: {
                ENVIRONMENT: environment,
                DYNAMODB_TABLE_NAME: dynamodbTable.tableName,
            },
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });
        dynamodbTable.grantReadWriteData(createUserFunction);

        usersResource.addMethod('POST', new LambdaIntegration(createUserFunction), {
            apiKeyRequired: apiKeySecretName !== undefined,
            requestModels: {
                'application/json': restApi.addModel('post-users-model', {
                    schema: createUserSchema,
                }),
            },
            requestValidator: restApi.addRequestValidator(`${this.stackName}-post-users`, {
                validateRequestBody: true,
            }),
        });

        // resource /users/:username
        const usernameResource = usersResource.addResource('{username}');

        // PATCH /users/:username

        const updateUserFunction = new aws_lambda_nodejs.NodejsFunction(this, 'update-user-function', {
            functionName: `${this.stackName}-user-update`,
            description: 'A function to update user record',
            entry: 'src/lambdas/users-update.ts',
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            environment: {
                ENVIRONMENT: environment,
                DYNAMODB_TABLE_NAME: dynamodbTable.tableName,
            },
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });
        dynamodbTable.grantReadWriteData(updateUserFunction);

        usernameResource.addMethod('PATCH', new LambdaIntegration(updateUserFunction), {
            apiKeyRequired: apiKeySecretName !== undefined,
            requestParameters: {
                'method.request.path.username': true,
            },
            requestModels: {
                'application/json': restApi.addModel('patch-users-model', {
                    schema: updateUserSchema,
                }),
            },
            requestValidator: restApi.addRequestValidator(`${this.stackName}-patch-users`, {
                validateRequestBody: true,
                validateRequestParameters: true,
            }),
        });

        // GET /users/:username

        const getUserFunction = new aws_lambda_nodejs.NodejsFunction(this, 'get-user-function', {
            functionName: `${this.stackName}-user-tet`,
            description: 'A function to get user record',
            entry: 'src/lambdas/users-get.ts',
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            environment: {
                ENVIRONMENT: environment,
                DYNAMODB_TABLE_NAME: dynamodbTable.tableName,
            },
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });
        dynamodbTable.grantReadData(getUserFunction);

        usernameResource.addMethod('GET', new LambdaIntegration(getUserFunction), {
            requestParameters: {
                'method.request.path.username': true,
            },
            requestValidator: restApi.addRequestValidator(`${this.stackName}-get-users`, {
                validateRequestParameters: true,
            }),
        });
    }
}

const createUserSchema: JsonSchema = {
    type: JsonSchemaType.OBJECT,
    properties: {
        username: {
            type: JsonSchemaType.STRING,
        },
        fullName: {
            type: JsonSchemaType.STRING,
        },
        email: {
            type: JsonSchemaType.STRING,
        },
        address: {
            type: JsonSchemaType.STRING,
        },
    },
    required: ['username', 'fullName', 'email'],
    additionalProperties: false,
};

const updateUserSchema: JsonSchema = {
    type: JsonSchemaType.OBJECT,
    properties: {
        fullName: {
            type: JsonSchemaType.STRING,
        },
        email: {
            type: JsonSchemaType.STRING,
        },
        address: {
            type: JsonSchemaType.STRING,
        },
    },
    additionalProperties: false,
};
