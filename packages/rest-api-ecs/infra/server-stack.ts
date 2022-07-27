/**
 * CDK Stack that provisions required AWS resources for the express.js hosted on AWS ECS.
 */

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { ECSConstruct } from './ecs-construct';
import { WAFConstruct } from './waf-construct';

interface ServerStackProps extends StackProps {
    readonly environment: string;
    readonly hostedZoneDomain: string;
    readonly containerPort: string;
}

export class ServerStack extends Stack {
    constructor(scope: Construct, id: string, props: ServerStackProps) {
        super(scope, id, props);

        const { environment, hostedZoneDomain, containerPort } = props;

        const { waf } = new WAFConstruct(this, 'waf-construct', { environment });

        new ECSConstruct(this, 'ecs-construct', {
            environment,
            hostedZoneDomain,
            containerPort,
            waf,
        });
    }
}
