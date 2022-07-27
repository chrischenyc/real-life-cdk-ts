/**
 * AWS CDK Construct that provisions AWS ECS and related resources.
 */

import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from './base-construct';

interface EcsConstructProps extends BaseConstructProps {
    readonly hostedZoneDomain: string;
    readonly containerPort: string;
    readonly waf?: wafv2.CfnWebACL;
    readonly ecsClusterName?: string;
    readonly vpcId?: string;
}

export class EcsConstruct extends BaseConstruct {
    constructor(scope: Construct, id: string, props: EcsConstructProps) {
        super(scope, id, props);

        const { hostedZoneDomain, containerPort, waf, ecsClusterName, vpcId } = props;

        // API base url is a subdomain of the given hosted zone root domain
        // example: for a hosted zone domain example.com, the generated API base url is rest-api-ecs.example.com
        const apiDomain = `rest-api-ecs.${hostedZoneDomain}`;

        const domainZone = route53.HostedZone.fromLookup(this, 'domain-zone', {
            domainName: hostedZoneDomain,
        });

        const apiDomainCert = new certificatemanager.Certificate(this, 'api-domain-cert', {
            domainName: apiDomain,
            validation: certificatemanager.CertificateValidation.fromDns(domainZone),
        });

        // look up an existing VPC or create a new one
        const vpc = vpcId
            ? ec2.Vpc.fromLookup(this, 'vpc', { vpcId: props.vpcId })
            : new ec2.Vpc(this, 'vpc', {
                  vpcName: this.stackName,
                  maxAzs: 2,
                  // share NAT instance among AZs in non-prod env, for cost saving
                  natGateways: this.isProd ? 2 : 1,
                  // NAT instance rather than NAT gateway, for cost saving
                  natGatewayProvider: new ec2.NatInstanceProvider({
                      instanceType: new ec2.InstanceType(this.isProd ? 't3.micro' : 't3.nano'),
                  }),
              });

        // look up an existing ECS cluster or create a new one
        const ecsCluster = ecsClusterName
            ? ecs.Cluster.fromClusterAttributes(this, 'ecs-cluster', {
                  clusterName: ecsClusterName,
                  vpc,
                  securityGroups: [],
              })
            : new ecs.Cluster(this, 'ecs-cluster', {
                  clusterName: this.stackName,
                  vpc: vpc,
              });

        //   ECS service, task definition, ALB, etc
        const { loadBalancer } = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'ecs-service-alb', {
            serviceName: this.stackName,
            cluster: ecsCluster,

            // ECS task definition
            taskImageOptions: {
                image: ecs.ContainerImage.fromAsset('./', {
                    buildArgs: {
                        // $PORT is used in Dockerfile
                        PORT: containerPort,
                    },
                }),
                containerName: 'api-server',
                containerPort: parseInt(containerPort),
                environment: {
                    PORT: containerPort,
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

            // ALB custom domain and TLS cert
            domainName: apiDomain,
            domainZone: domainZone,
            certificate: apiDomainCert,
            loadBalancerName: this.stackName,
        });

        // guard ALB with available WAF rules, which are defined on the account level
        if (waf) {
            new wafv2.CfnWebACLAssociation(this, 'alb-waf', {
                resourceArn: loadBalancer.loadBalancerArn,
                webAclArn: waf.attrArn,
            });
        }
    }
}
