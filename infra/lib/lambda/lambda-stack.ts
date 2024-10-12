import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";

export class HelloLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListLambdaFunction = new lambda.Function(
      this,
      "getProductsList",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "getProductsList.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      }
    );

    const getProductsByIdLambdaFunction = new lambda.Function(
      this,
      "getProductsById",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "getProductsById.main",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      }
    );

    const api = new apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions.",
    });

    const ProductsListLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsListLambdaFunction,
      {
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        proxy: false,
      }
    );

    const ProductsByIdLambdaIntegration = new apigateway.LambdaIntegration(
      getProductsByIdLambdaFunction,
      {
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        requestTemplates: {
          "application/json": JSON.stringify({
            pathParameters: {
              productId: "$input.params('productId')",
            },
          }),
        },
        proxy: false,
      }
    );

    // Create a resource /hello and GET request under it
    const ProductsListResource = api.root.addResource("products");
    // On this resource attach a GET method which pass reuest to our Lambda function
    ProductsListResource.addMethod("GET", ProductsListLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    ProductsListResource.addCorsPreflight({
      allowOrigins: ["https://d1zh618m90woj0.cloudfront.net"],
      allowMethods: ["GET"],
    });

    const ProductsByIdResource =
      ProductsListResource.addResource("{productId}");
    ProductsByIdResource.addMethod("GET", ProductsByIdLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    ProductsByIdResource.addCorsPreflight({
      allowOrigins: ["https://d1zh618m90woj0.cloudfront.net"],
      allowMethods: ["GET"],
    });
  }
}
