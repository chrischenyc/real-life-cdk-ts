# Real life CDK TypeScript

a collection of CDK 2 demo projects in TypeScript.

-   [Overview](#overview)
-   [Tech](#tech)
-   [npm Scripts](#npm-scripts)
-   [Manual Deployment](#manual-deployment)
-   [Contributing](CONTRIBUTING.md)

## Overview

This monorepo is managed by [lerna](https://lerna.js.org/).

Each lerna package can be deployed as a standalone AWS CloudFormation stack.

The Infra-as-Code is [AWS CDK 2](https://docs.aws.amazon.com/cdk/v2/guide/home.html) in TypeScript.

The application code is in TypeScript too.

## Tech

-   node 16.x (see [.nvmrc](.nvmrc)):
    -   AWS CDK requires Node.js [LTS releases](https://nodejs.org/en/about/releases/).
    -   AWS Lambda Node.js runtime supports up to Node.js 16.x.
    -   It's recommended to use [nvm](https://github.com/nvm-sh/nvm) tool to manage your local Node.js versions. For zsh users, plugin [zsh-nvm](https://github.com/lukechilds/zsh-nvm) can be handy.
-   npm
-   Typescript V3
-   AWS CDK V2
-   AWS SDK for JavaScript V3
-   Prettier, ESlint, Commitlint, lint-staged
-   Jest
-   AWS services per system architecture diagrams

## npm Scripts

List available npm scripts and their descriptions here.

-   `deploy`: deploy all or an individual service
-   `lint`: lint codebase with ESlint
-   `lint:fix`: auto-fix ESLint errors
-   `commit`: preferred way to create a git commit
-   `test`: run unit tests

## Manual Deployment

-   ensure your command line has access to an AWS account. it is recommended to [configure AWS CLI to use AWS SSO](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html).
-   if you haven't, [bootstrap](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) CDK in your AWS account.

```bash
# will deploy everything
npm run deploy
```

```bash
# will only deploy package @capturedlabs/rest-api-container-ecs
npm run deploy --scope=@capturedlabs/rest-api-container-ecs
```

## Projects

-   [Container-based REST API on ECS](./packages/rest-api-ecs/README.container-md)
