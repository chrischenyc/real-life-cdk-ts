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

import { RestApiServerlessStack } from './stack';

const app = new cdk.App();

if (!process.env.ENV) {
    throw new Error('missing env var ENV');
}
if (!process.env.AWS_ACCOUNT) {
    throw new Error('missing env var AWS_ACCOUNT');
}
if (!process.env.AWS_REGION) {
    throw new Error('missing env var AWS_REGION');
}
if (!process.env.AWS_HOSTED_ZONE_DOMAIN) {
    throw new Error('missing env var AWS_HOSTED_ZONE_DOMAIN');
}

new RestApiServerlessStack(app, `rest-api-serverless-${process.env.ENV}`, {
    stackName: `rest-api-serverless-${process.env.ENV}`,
    description: `REST API server implemented with serverless - ${process.env.ENV}`,
    tags: {
        // tagging for AWS cost/billing
        Environment: process.env.ENV,
    },
    env: {
        // https://docs.aws.amazon.com/cdk/v2/guide/environments.html
        account: process.env.AWS_ACCOUNT,
        region: process.env.AWS_REGION,
    },
    // Configure with APIs (properties, methods), not environment variables
    // https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html
    environment: process.env.ENV,
    hostedZoneDomain: process.env.AWS_HOSTED_ZONE_DOMAIN,
    apiKeySecretName: process.env.AWS_SECRETS_MANAGER_API_KEY_SECRET,
});
