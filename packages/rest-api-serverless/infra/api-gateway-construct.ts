/**
 * AWS CDK Construct that provisions AWS ECS and related resources.
 */

import { RemovalPolicy } from 'aws-cdk-lib';
import { Cors, LogGroupLogDestination, MethodLoggingLevel, ResponseType, RestApi } from 'aws-cdk-lib/aws-apigateway';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { CfnWebACLAssociation } from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

import { BaseConstruct, BaseConstructProps } from './base-construct';

interface APIGatewayConstructProps extends BaseConstructProps {
    readonly hostedZoneDomain: string;
    readonly waf?: wafv2.CfnWebACL;
    readonly apiKeySecretName?: string;
}

export class APIGatewayConstruct extends BaseConstruct {
    public readonly restApi: RestApi;

    constructor(scope: Construct, id: string, props: APIGatewayConstructProps) {
        super(scope, id, props);

        const { hostedZoneDomain, waf, apiKeySecretName } = props;

        // API base url is a subdomain of the given hosted zone root domain
        // example: for a hosted zone domain example.com, the generated API base url is rest-api-ecs.example.com
        const apiDomain = `rest-api-serverless.${hostedZoneDomain}`;

        const domainZone = route53.HostedZone.fromLookup(this, 'domain-zone', {
            domainName: hostedZoneDomain,
        });

        const apiDomainCert = new certificatemanager.Certificate(this, 'api-domain-cert', {
            domainName: apiDomain,
            validation: certificatemanager.CertificateValidation.fromDns(domainZone),
        });

        const logGroup = new LogGroup(this, 'api-gateway-access-log', {
            logGroupName: `${this.stackName}-api-gateway-access-log`,
            removalPolicy: this.isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
            retention: this.isProd ? RetentionDays.SIX_MONTHS : RetentionDays.ONE_DAY,
        });

        // API Gateway RestAPI Root
        this.restApi = new RestApi(this, 'rest-api', {
            restApiName: `${this.stackName}-rest-api`,
            description: 'simple REST API done with serverless',
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(logGroup),
                dataTraceEnabled: true,
                tracingEnabled: true,
                stageName: 'v1',
                metricsEnabled: this.isProd,
                loggingLevel: this.isProd ? MethodLoggingLevel.ERROR : MethodLoggingLevel.INFO,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowCredentials: true,
                allowHeaders: Cors.DEFAULT_HEADERS.concat(['Authorization']),
            },
            binaryMediaTypes: [
                'application/pdf',
                'image/png',
                'image/jpeg',
                'image/pjpeg',
                'image/x-jps',
                'image/tiff',
                'application/msword',
                'application/vnd.ms-word.document.macroEnabled.12',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
            domainName: {
                domainName: apiDomain,
                certificate: apiDomainCert,
            },
        });

        new ARecord(this, 'api-dns', {
            zone: domainZone,
            recordName: 'rest-api-serverless',
            target: RecordTarget.fromAlias(new ApiGateway(this.restApi)),
        });

        this.restApi.addGatewayResponse('BAD_REQUEST_BODY', {
            type: ResponseType.BAD_REQUEST_BODY,
            responseHeaders: {
                'Access-Control-Allow-Origin': `'*'`,
            },
            templates: {
                'application/json':
                    '{ "message": $context.error.messageString, "validationErrors": "$context.error.validationErrorString" }',
            },
        });
        this.restApi.addGatewayResponse('DEFAULT_4XX', {
            type: ResponseType.DEFAULT_4XX,
            responseHeaders: {
                'Access-Control-Allow-Origin': `'*'`,
            },
        });
        this.restApi.addGatewayResponse('DEFAULT_5XX', {
            type: ResponseType.DEFAULT_5XX,
            responseHeaders: {
                'Access-Control-Allow-Origin': `'*'`,
            },
        });

        // API Gateway API Key
        if (apiKeySecretName) {
            const apiKey = this.restApi.addApiKey('api-key', {
                apiKeyName: `${this.stackName}-api-key`,
                value: Secret.fromSecretNameV2(this, `api-key-secret`, apiKeySecretName)
                    .secretValue.unsafeUnwrap()
                    .toString(),
            });

            const plan = this.restApi.addUsagePlan('usage-plan', {
                name: `${this.stackName}-api-usage-plan`,
                apiStages: [{ stage: this.restApi.deploymentStage }],
            });
            plan.addApiKey(apiKey);
        }

        // guard api gateway with available WAF rules
        if (waf) {
            new CfnWebACLAssociation(this, 'api-waf-acl', {
                webAclArn: waf.attrArn,
                resourceArn: this.restApi.deploymentStage.stageArn,
            });
        }
    }
}
