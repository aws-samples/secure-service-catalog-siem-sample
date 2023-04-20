import { Bucket, BucketEncryption, IBucket } from "@aws-cdk/aws-s3";
import { Construct, Tags } from "@aws-cdk/core";
import { CdkPipelineStackProps } from "./../cdk-secure-service-catalog-stack";


export interface S3ServiceCatalogSourceBucketProps extends CdkPipelineStackProps {
    bucketName: string;
}

export class S3ServiceCatalogSourceBucket extends Construct {
    public readonly bucket: IBucket;

    constructor(parent: Construct, name: string, props: S3ServiceCatalogSourceBucketProps) {
        super(parent, name);

        this.bucket = new Bucket(this, "ServiceCatalogSourceBucket", {
            blockPublicAccess: {
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true,
            },
            bucketName: props.bucketName,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            versioned: true,
        });

        Tags.of(this.bucket).add("Solution", props.prefixSolution);
        Tags.of(this.bucket).add("FriendlyName", "S3 Bucket ServiceCatalog");
        Tags.of(this.bucket).add("Description", `S3 Bucket for ServiceCatalog artifacts.`);
    }
}