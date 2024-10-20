import { APIGatewayProxyEvent, Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import { productBodySchema } from "../../shared/productSchema";
import { ZodError } from "zod";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export const handler: Handler = async (event: APIGatewayProxyEvent) => {
  try {
    const product: typeof productBodySchema = event.body
      ? JSON.parse(event.body)
      : {};

    console.log("event:", event);

    const parsedProduct = productBodySchema.parse(product);

    const command = new PutItemCommand({
      TableName: tableName,
      Item: {
        id: { S: randomUUID() },
        createdAt: { N: new Date().getTime().toFixed() },
        count: { N: parsedProduct.count.toString() },
        price: { N: parsedProduct.price.toString() },
        title: { S: parsedProduct.title },
        description: { S: parsedProduct.description },
      },
    });

    const result = await dynamoDB.send(command);

    console.log(
      "Product was added successfully:",
      JSON.stringify(result, null, 2)
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    }

    console.error("Error:", error);
    throw new Error("Error adding item to DynamoDB table");
  }
};
