// async function runs before all test
// https://jestjs.io/docs/configuration#globalsetup-string

/* eslint-disable @typescript-eslint/no-var-requires */
const { GetSecretValueCommand, SecretsManagerClient } = require('@aws-sdk/client-secrets-manager');

module.exports = async function () {
    /* eslint-disable @typescript-eslint/no-var-requires */
    require('dotenv').config({
        path: `integration/${process.env.ENV || 'dev'}.env`,
    });

    const secretsManagerClient = new SecretsManagerClient({
        region: process.env.AWS_DEFAULT_REGION,
    });

    const { SecretString } = await secretsManagerClient.send(
        new GetSecretValueCommand({
            SecretId: process.env.AWS_SECRETS_MANAGER_API_KEY_SECRET,
        })
    );
    process.env.API_KEY = SecretString;
};
