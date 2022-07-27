#!/usr/bin/env node

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

import { ServerStack } from './server-stack';

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
if (!process.env.PORT) {
    throw new Error('missing env var process.env.PORT');
}
if (!process.env.HOSTED_ZONE_DOMAIN) {
    throw new Error('missing env var process.env.HOSTED_ZONE_DOMAIN');
}

new ServerStack(app, `api-server-${process.env.ENV}`, {
    stackName: `api-server-${process.env.ENV}`,
    description: `API server ${process.env.ENV}`,
    tags: {
        // tagging for AWS cost/billing
        Environment: process.env.ENV,
    },
    env: {
        // env vars are injected during CI/CD runtime, see .gitlab-ci.yml
        // https://docs.aws.amazon.com/cdk/v2/guide/environments.html
        account: process.env.AWS_ACCOUNT_DEPLOY,
        region: process.env.AWS_DEFAULT_REGION,
    },

    environment: process.env.ENV,
    hostedZoneDomain: process.env.HOSTED_ZONE_DOMAIN,
    containerPort: process.env.PORT,
});
