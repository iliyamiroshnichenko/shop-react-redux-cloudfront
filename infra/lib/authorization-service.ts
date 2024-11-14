import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const githubLogin = process.env.GITHUB_LOGIN;
    const testPass = process.env.TEST_PASS;
    const credentials = `${githubLogin}=${testPass}`;

    const basicAuthorizerLambdaFunction = new NodejsFunction(
      this,
      "basic-authorizer-lambda-function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        environment: {
          CREDENTIALS: credentials,
        },
        entry: path.join(__dirname, "../lambda/basic-authorizer-lambda.ts"),
      }
    );
  }
}
