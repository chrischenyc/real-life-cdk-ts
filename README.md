# Real life CDK TypeScript

A collection of CDK 2 demo projects in TypeScript.

This is a monorepo managed by [lerna](https://lerna.js.org/). Each lerna package can be deployed to a standalone AWS CloudFormation stack.

-   [Tech](#tech)
-   [npm Scripts](#npm-scripts)
-   [Manual Deployment](#manual-deployment)
-   [Demo Projects](#demo-projects)
-   [Contributing](CONTRIBUTING.md)

## Tech

-   Node.js 16.x:
    -   AWS CDK requires Node.js [LTS releases](https://nodejs.org/en/about/releases/).
    -   [AWS Lambda runtime](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html) supports up to Node.js 16.x.
    -   It's recommended to use [nvm](https://github.com/nvm-sh/nvm) to manage your local Node.js versions, see [.nvmrc](.nvmrc). For zsh users, plugin [zsh-nvm](https://github.com/lukechilds/zsh-nvm) can be handy.
-   Typescript 4.x
-   AWS CDK 2
-   AWS SDK for JavaScript 3
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
# will only deploy package @capturedlabs/rest-api-ecs
npm run deploy --scope=@capturedlabs/rest-api-ecs
```

## Demo Projects

-   [Container-based REST API on ECS](./packages/rest-api-ecs/README.md)
