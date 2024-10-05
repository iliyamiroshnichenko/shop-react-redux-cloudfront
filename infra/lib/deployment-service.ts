import { Construct } from "constructs";
import {
  aws_s3,
  aws_cloudfront,
  aws_cloudfront_origins,
  aws_s3_deployment,
  CfnOutput,
} from "aws-cdk-lib";

const path = "./resources/build";

export class DeploymentService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const hostingBucket = new aws_s3.Bucket(this, "iliyamirCDKBucket", {
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
    });

    const distribution = new aws_cloudfront.Distribution(
      this,
      "iliyamirCloudfrontDistribution",
      {
        defaultBehavior: {
          origin: new aws_cloudfront_origins.S3Origin(hostingBucket),
          viewerProtocolPolicy:
            aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: "index.html",
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          },
        ],
      }
    );
    new aws_s3_deployment.BucketDeployment(this, "BucketDeployment", {
      sources: [aws_s3_deployment.Source.asset(path)],
      destinationBucket: hostingBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    new CfnOutput(this, "iliyamirCloudFrontURL", {
      value: distribution.domainName,
      description: "The distribution URL",
      exportName: "iliyamirCloudFrontURL",
    });

    new CfnOutput(this, "iliyamirBucketName", {
      value: hostingBucket.bucketName,
      description: "The name of the S3 bucket",
      exportName: "iliyamirBucketName",
    });
  }
}
