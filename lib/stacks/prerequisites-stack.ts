import { IKey } from "@aws-cdk/aws-kms";
import { CfnBucket, IBucket } from "@aws-cdk/aws-s3";
import { BucketDeployment, Source } from "@aws-cdk/aws-s3-deployment";
import { CfnOutput, Construct, Stack } from "@aws-cdk/core";
import { S3ServiceCatalogSourceBucket } from "../service-catalog/s3-service-catalog-source";
import { CdkPipelineStackProps } from "./../cdk-secure-service-catalog-stack";

export interface PrerequisitesStackProps extends CdkPipelineStackProps {
    enableKmsServerAccessLogs: boolean;
    retentionPeriodDaysServerAccessLogs?: number;
}

export class PrerequisitesStack extends Stack {
    public readonly s3ServerAccessLogsBucket: CfnBucket;
    public readonly s3ServiceCatalogSourceBucket: IBucket;
    constructor(scope: Construct, id: string, props: PrerequisitesStackProps) {
        super(scope, id, props);

        let salKmsKey: IKey | undefined; 

        // S3 ServiceCatalog Artifacts Bucket
        const artifactsBucket = new S3ServiceCatalogSourceBucket(this, "S3ServiceCatalogSourceBucket", {
            bucketName: `${props.prefixSolution}-sc-artifacts-${Stack.of(this).account}`,
            prefixSolution: props.prefixSolution,
            branchRepository: props.branchRepository,
            env: props.env,
        });

        this.s3ServiceCatalogSourceBucket = artifactsBucket.bucket;

        new BucketDeployment(this, "DeploymentArtifactS3SecureBucket", {
            destinationBucket: artifactsBucket.bucket,
            sources: [
                Source.asset(`${__dirname}/../assets`)
            ]
        });


        // CloudFormation Outputs
        new CfnOutput(this, "S3ServiceCatalogSourceBucketCfnOutput", {
            value: artifactsBucket.bucket.bucketArn,
            description: "ARN of the S3 ServiceCatalog Artifacts Bucket.",
            exportName: "S3ServiceCatalogSourceBucketARN",
        });
    }
}