import { aws_lambda, aws_lambda_nodejs } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from '../base-construct';

interface HealthApiConstructProps extends BaseConstructProps {
    readonly restApi: RestApi;
}

export class HealthApiConstruct extends BaseConstruct {
    constructor(scope: Construct, id: string, props: HealthApiConstructProps) {
        super(scope, id, props);

        const { environment, restApi } = props;

        const healthResource = restApi.root.addResource('health');

        const healthFunction = new aws_lambda_nodejs.NodejsFunction(this, 'health-function', {
            functionName: `${this.stackName}-health-check`,
            description: 'A function to provide health checks',
            entry: 'src/lambdas/health.ts',
            handler: 'handler',
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            environment: {
                ENVIRONMENT: environment,
            },
            tracing: Tracing.ACTIVE,
            logRetention: RetentionDays.ONE_WEEK,
        });

        healthResource.addMethod('GET', new LambdaIntegration(healthFunction));
    }
}
