import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDB);
const tableName = process.env.TABLE_NAME as string;

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const id = event.pathParameters?.id;

    console.log("event:", event);

    if (!id)
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "id was not provided" }),
      };

    const command = new GetCommand({
      TableName: tableName,
      Key: {
        id: id,
      },
    });

    const result = await ddbDocClient.send(command);

    if (result.Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `Product with id:${id} was not found`,
        }),
      };
    }
  } catch (error) {
    console.log("error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to retrieve products", error }),
    };
  }
}
