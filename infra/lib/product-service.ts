import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
}

const PRODUCTS_TABLE_NAME = "Products";

export const productsMock: readonly Product[] = [
  {
    id: "game1",
    title: "Bloodborne",
    description: "Bloodborne description",
    price: 499,
    count: 10,
  },
  {
    id: "game2",
    title: "God of War",
    description: "God of War description",
    price: 1199,
    count: 5,
  },
  {
    id: "game3",
    title: "God of War. Ragnarok",
    description: "God of War Ragnarok description",
    price: 1999,
    count: 8,
  },
  {
    id: "game4",
    title: "Prince of Persia. Lost Crown",
    description: "Prince of Persia. Lost Crown description",
    price: 999,
    count: 12,
  },
];

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "products-api", {
      restApiName: "API Gateway for product service",
      description: "This API serves the product lambda functions.",
    });

    const productsTable = new dynamodb.Table(this, PRODUCTS_TABLE_NAME, {
      tableName: PRODUCTS_TABLE_NAME,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
    });

    const getAllProductsLambdaFunction = new NodejsFunction(
      this,
      "get-products-list-lambda-function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        environment: {
          TABLE_NAME: PRODUCTS_TABLE_NAME,
        },
        entry: path.join(__dirname, "./lambda/getProductsList.ts"),
      }
    );

    const getProductByIDLambdaFunction = new NodejsFunction(
      this,
      "get-product-by-id-lambda-function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        environment: {
          TABLE_NAME: PRODUCTS_TABLE_NAME,
        },
        entry: path.join(__dirname, "./lambda/getProductsById.ts"),
      }
    );

    const createProductLambdaFunction = new NodejsFunction(
      this,
      "create-product-lambda-function",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        environment: {
          TABLE_NAME: PRODUCTS_TABLE_NAME,
        },
        entry: path.join(__dirname, "./lambda/createProduct.ts"),
      }
    );

    const allProductsLambdaIntegration = new apigateway.LambdaIntegration(
      getAllProductsLambdaFunction,
      {
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        proxy: true,
      }
    );

    const productsByIDLambdaIntegration = new apigateway.LambdaIntegration(
      getProductByIDLambdaFunction,
      {
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        proxy: true,
      }
    );

    const createProductLambdaIntegration = new apigateway.LambdaIntegration(
      createProductLambdaFunction,
      {
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        proxy: true,
      }
    );

    const allProductsResource = api.root.addResource("products");
    const productByIDResource = allProductsResource.addResource("{id}");

    allProductsResource.addMethod("GET", allProductsLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    allProductsResource.addMethod("POST", createProductLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    productByIDResource.addMethod("GET", productsByIDLambdaIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    allProductsResource.addCorsPreflight({
      allowOrigins: ["https://d2f5p6ybnx6itx.cloudfront.net"],
      allowMethods: ["GET"],
    });

    productsTable.grantWriteData(createProductLambdaFunction);
    productsTable.grantReadData(getAllProductsLambdaFunction);
    productsTable.grantReadData(getProductByIDLambdaFunction);
  }
}
