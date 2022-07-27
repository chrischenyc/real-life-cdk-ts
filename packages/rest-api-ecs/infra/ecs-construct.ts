/**
 * AWS CDK Construct that provisions AWS ECS and related resources.
 */

import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from './base-construct';

interface ECSConstructProps extends BaseConstructProps {
    readonly hostedZoneDomain: string;
    readonly containerPort: string;
    readonly waf?: wafv2.CfnWebACL;
}

export class ECSConstruct extends BaseConstruct {
    constructor(scope: Construct, id: string, props: ECSConstructProps) {
        super(scope, id, props);

        // ECS service for running the Docker image hosed in ECR repo
        const domainZone = route53.HostedZone.fromLookup(this, 'domain-zone', {
            domainName: props.hostedZoneDomain,
        });
        const apiUrl = `api.${props.hostedZoneDomain}`;

        const { loadBalancer } = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'api-server-ecs', {
            serviceName: 'api-server',

            // ECS task definition
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('./', {
                    buildArgs: {
                        PORT: props.containerPort,
                    },
                }),
                containerName: 'api-server',
                containerPort: parseInt(props.containerPort),
                environment: {
                    PORT: props.containerPort,
                },
            },

            // deployment characteristics
            circuitBreaker: {
                rollback: true,
            },

            // TODO: scaling, fine-tune PROD config
            desiredCount: this.isProd ? 2 : 1,
            cpu: this.isProd ? 512 : 256,
            memoryLimitMiB: this.isProd ? 1024 : 512,

            // the ECS service is fronted by an ALB, which listens to 443 HTTPS
            domainName: apiUrl,
            domainZone: domainZone,
            certificate: new certificatemanager.Certificate(this, 'api-server-domain-cert', {
                domainName: apiUrl,
                validation: certificatemanager.CertificateValidation.fromDns(domainZone),
            }),
            publicLoadBalancer: true,
            loadBalancerName: `${this.stackName}-api`,
        });

        // guard ALB with available WAF rules, which are defined on the account level
        if (props.waf) {
            new wafv2.CfnWebACLAssociation(this, 'alb-waf', {
                resourceArn: loadBalancer.loadBalancerArn,
                webAclArn: props.waf.attrArn,
            });
        }
    }
}
