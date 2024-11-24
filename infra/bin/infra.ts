#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DeployWebAppStack } from "../lib/deploy-web-app-stack";
import { HelloLambdaStack } from "../lib/lambda/lambda-stack";
import { TodoStack } from "../lib/todo/TodoStack";
import { ProductServiceStack } from "../lib/product-service";
import { ImportServiceStack } from "../lib/import-service-stack";
import { ProductSqsStack } from "../lib/product-sqs/product-sqs-stack";
import { ProductSnsStack } from "../lib/product-sns/product-sns-stack";
import { AuthorizerStack } from "../lib/authorizer-stack";
import { HelloRdsStack } from "../lib/hello-rds/hello-rds-stack";
import { AppStack } from "../lib/app-stack";
import * as path from "path";

const app = new cdk.App();
new DeployWebAppStack(app, "DeployWebAppStack", {});
new HelloLambdaStack(app, "HelloLambdaStack", {});

new TodoStack(app, "TodoStack");

new ProductServiceStack(app, "ProductServiceStack", {});

new ImportServiceStack(app, "ImportServiceStack", {});

new ProductSqsStack(app, "ProductSqsStack");
new ProductSnsStack(app, "ProductSnsStack");

new AuthorizerStack(app, "AuthorizerStack");

new HelloRdsStack(app, "HelloRdsStack", {
  env: { account: app.account, region: app.region },
});

new AppStack(app, "AppStack", {
  lambdaPath: path.resolve(__dirname, "..", "nest-app.zip"),
  lambdaHandler: "dist/lambda.handler",
});
