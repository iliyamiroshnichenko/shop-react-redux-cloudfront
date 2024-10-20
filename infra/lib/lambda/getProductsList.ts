import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.TABLE_NAME as string;

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const command = new ScanCommand({
      TableName: tableName,
    });

    console.log("event:", event);

    const result = await dynamoDB.send(command);

    const formattedItems = result.Items?.map((item) => {
      return {
        id: item.id.S,
        createdAt: item.createdAt.N,
        count: item.count.N,
        price: item.price.N,
        title: item.title.S,
        description: item.description.S,
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(formattedItems),
    };
  } catch (error) {
    return {};
  }
}
