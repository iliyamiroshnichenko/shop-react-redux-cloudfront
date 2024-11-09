import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class AuthorizerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerExampleLambdaFunction = new NodejsFunction(
      this,
      "authorizer-example-lambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        entry: path.join(__dirname, "../lambda/authorizer-example-lambda.ts"),
      }
    );

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions.",
    });

    const userPool = new cognito.UserPool(this, "my-user-pool", {
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        familyName: {
          mutable: true,
          required: true,
        },
        phoneNumber: { required: false },
      },
      customAttributes: {
        createdAt: new cognito.DateTimeAttribute(),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Application Client
    const appClient = userPool.addClient("my-app-client", {
      userPoolClientName: "my-app-client",
      authFlows: {
        userPassword: true,
      },
    });

    // Cognito domain
    const domain = userPool.addDomain("Domain", {
      cognitoDomain: {
        domainPrefix: "authorization",
      },
    });

    // Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "my-authorizer",
      {
        authorizerName: "my-authorizer",
        cognitoUserPools: [userPool], // Connect using the User Pool
      }
    );

    const authorizerExampleLambdaIntegration = new apigateway.LambdaIntegration(
      authorizerExampleLambdaFunction,
      {
        requestTemplates: {
          "application/json": `{ "message": "$input.params('message')" }`,
        },
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        proxy: false,
      }
    );

    // Create a resource /hello and GET request under it
    const helloResource = api.root.addResource("hello");
    // On this resource attach a GET method which pass reuest to our Lambda function
    helloResource.addMethod("GET", authorizerExampleLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
      authorizer,
    });
  }
}
