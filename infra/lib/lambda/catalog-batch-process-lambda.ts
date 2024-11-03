import { v4 as uuidv4 } from "uuid";
import { SQSHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { productBodySchema } from "../../shared/productSchema";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const snsClient = new SNSClient({ region: "us-east-1" });

const tableName = process.env.TABLE_NAME;
const snsTopicArn = process.env.SNS_TOPIC_ARN;

export const handler: SQSHandler = async (event) => {
  try {
    for (const record of event.Records) {
      const product: typeof productBodySchema = record.body
        ? JSON.parse(record.body)
        : {};

      const parsedProduct = productBodySchema.parse(product);

      const params = {
        TableName: tableName,
        Item: {
          id: { S: uuidv4() },
          createdAt: { N: new Date().getTime().toFixed() },
          count: { N: parsedProduct.count.toString() },
          price: { N: parsedProduct.price.toString() },
          title: { S: parsedProduct.title },
          description: { S: parsedProduct.description },
        },
      };

      const command = new PutItemCommand(params);
      await dynamoDbClient.send(command);

      const snsMessage = {
        subject: "New Product Created",
        message: `A new product has been created: ${JSON.stringify(product)}`,
      };
      const publishCommand = new PublishCommand({
        TopicArn: snsTopicArn,
        Message: snsMessage.message,
        Subject: snsMessage.subject,
      });
      await snsClient.send(publishCommand);
    }
  } catch (error) {
    console.error("Error adding products to DynamoDB:", error);
  }
};
