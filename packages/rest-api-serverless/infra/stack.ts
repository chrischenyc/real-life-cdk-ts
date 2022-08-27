/**
 * CDK Stack that provisions required AWS resources for the express.js hosted on AWS ECS.
 */

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { HealthApiConstruct, UsersApiConstruct } from './api';
import { APIGatewayConstruct } from './api-gateway-construct';
import { DynamoDBConstruct } from './dynamodb-construct';
import { WafConstruct } from './waf-construct';

interface RestApiServerlessStackProps extends StackProps {
    readonly environment: string;
    readonly hostedZoneDomain: string;
    readonly apiKeySecretName?: string;
}

export class RestApiServerlessStack extends Stack {
    constructor(scope: Construct, id: string, props: RestApiServerlessStackProps) {
        super(scope, id, props);

        const { environment, hostedZoneDomain, apiKeySecretName } = props;

        const { waf } = new WafConstruct(this, 'waf-construct', { environment });

        const { dynamodbTable, reversedGSIName } = new DynamoDBConstruct(this, 'dynamodb-construct', { environment });

        const { restApi } = new APIGatewayConstruct(this, 'api-gateway-construct', {
            environment,
            hostedZoneDomain,
            waf,
            apiKeySecretName,
        });

        new HealthApiConstruct(this, 'health-api', { environment, restApi });
        new UsersApiConstruct(this, 'users-apis', { environment, restApi, dynamodbTable, apiKeySecretName });
    }
}
