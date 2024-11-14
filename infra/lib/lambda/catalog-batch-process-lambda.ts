import { v4 as uuidv4 } from "uuid";
import { SQSHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { productBodySchema } from "../../shared/productSchema";
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);
const snsClient = new SNSClient({ region: "us-east-1" });

const tableName = process.env.TABLE_NAME;
const snsTopicArn = process.env.SNS_TOPIC_ARN;

export const handler: SQSHandler = async (event) => {
  const transactionItems = event.Records.flatMap((record) => {
    const product: typeof productBodySchema = record.body
      ? JSON.parse(record.body)
      : {};

    const parsedProduct = productBodySchema.parse(product);

    const productItem = {
      id: { S: uuidv4() },
      createdAt: { N: new Date().getTime().toFixed() },
      count: { N: parsedProduct.count.toString() },
      price: { N: parsedProduct.price.toString() },
      title: { S: parsedProduct.title },
      description: { S: parsedProduct.description },
    };

    return [
      {
        Put: {
          TableName: tableName,
          Item: productItem,
        },
      },
    ];
  });

  const transactionParams: TransactWriteCommandInput = {
    TransactItems: transactionItems,
  };

  try {
    await docClient.send(new TransactWriteCommand(transactionParams));

    const snsMessage = {
      subject: "Products Created",
      message: `Products saved successfully`,
    };
    const publishCommand = new PublishCommand({
      TopicArn: snsTopicArn,
      Message: snsMessage.message,
      Subject: snsMessage.subject,
    });
    await snsClient.send(publishCommand);
  } catch (error) {
    console.error("Error adding products to DynamoDB:", error);
  }
};
