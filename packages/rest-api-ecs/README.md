# Simple RESTful API server hosted on AWS ECS

-   [Overview](#overview)
-   [Local Development](#local-development)
-   [Manual Deployment](#manual-deployment)

## Overview

This is a vanilla express.js project in TypeScript. For demonstration purpose, it provides a few simple RESTful API endpoints, nothing fancy.

## Local Development

```bash
# build the latest docker image, expose port 3000
docker build -t api-server:latest --build-arg PORT=3000 .

# run the docker image
docker run -d --rm --env-file .env -p 3000:3000 api-server:latest

# test GET /
curl http://localhost:3000

# you should see {"message":"server is up 🚀"}
```

## Manual Deployment

-   ensure your command line has access to an AWS account. it is recommended to [configure AWS CLI to use AWS SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).
-   if you haven't, [bootstrap](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) CDK in your AWS account.

```bash
# will deploy everything
npm run deploy
```
