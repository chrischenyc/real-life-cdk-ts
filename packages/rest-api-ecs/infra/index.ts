/**
 * Entry point of CDK deployment.
 *
 * Environment variables:
 * - CI/CD: injected during CI/CD runtime
 * - local: inject from .env file, see README.md
 */

import 'source-map-support/register';
import 'dotenv/config';

import * as cdk from 'aws-cdk-lib';

import { RestApiEcsStack } from './stack';

const app = new cdk.App();

if (!process.env.ENV) {
    throw new Error('missing env var ENV');
}
if (!process.env.AWS_ACCOUNT_DEPLOY) {
    throw new Error('missing env var AWS_ACCOUNT_DEPLOY');
}
if (!process.env.AWS_DEFAULT_REGION) {
    throw new Error('missing env var AWS_DEFAULT_REGION');
}
if (!process.env.AWS_HOSTED_ZONE_DOMAIN) {
    throw new Error('missing env var AWS_HOSTED_ZONE_DOMAIN');
}
if (!process.env.PORT) {
    throw new Error('missing env var PORT');
}

new RestApiEcsStack(app, `rest-api-ecs-${process.env.ENV}`, {
    stackName: `rest-api-ecs-${process.env.ENV}`,
    description: `REST API server hosted on ECS - ${process.env.ENV}`,
    tags: {
        // tagging for AWS cost/billing
        Environment: process.env.ENV,
    },
    env: {
        // https://docs.aws.amazon.com/cdk/v2/guide/environments.html
        account: process.env.AWS_ACCOUNT_DEPLOY,
        region: process.env.AWS_DEFAULT_REGION,
    },
    // Configure with APIs (properties, methods), not environment variables
    // https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html
    environment: process.env.ENV,
    containerPort: process.env.PORT,
    hostedZoneDomain: process.env.AWS_HOSTED_ZONE_DOMAIN,
    vpcId: process.env.VPC_ID,
    ecsClusterName: process.env.AWS_ECS_CLUSTER,
});
