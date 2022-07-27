/**
 * CDK Stack that provisions required AWS resources for the express.js hosted on AWS ECS.
 */

import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { EcsConstruct } from './ecs-construct';
import { WafConstruct } from './waf-construct';

interface RestApiEcsStackProps extends StackProps {
    readonly environment: string;
    readonly hostedZoneDomain: string;
    readonly containerPort: string;
    readonly ecsClusterName?: string;
    readonly vpcId?: string;
}

export class RestApiEcsStack extends Stack {
    constructor(scope: Construct, id: string, props: RestApiEcsStackProps) {
        super(scope, id, props);

        const { environment, hostedZoneDomain, containerPort, ecsClusterName, vpcId } = props;

        const { waf } = new WafConstruct(this, 'waf-construct', { environment });

        new EcsConstruct(this, 'ecs-construct', {
            environment,
            hostedZoneDomain,
            containerPort,
            waf,
            ecsClusterName,
            vpcId,
        });
    }
}
