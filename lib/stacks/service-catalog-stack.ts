import { CfnBucket, IBucket } from "@aws-cdk/aws-s3";
import { CfnPortfolioProductAssociation, Portfolio } from "@aws-cdk/aws-servicecatalog";
import { CfnOutput, Construct, Stack, Tags } from "@aws-cdk/core";
import { CdkPipelineStackProps } from "./../cdk-secure-service-catalog-stack";
import { ServiceCatalogProduct } from "../service-catalog/service-catalog-product";

export interface ServiceCatalogStackProps extends CdkPipelineStackProps {
    s3ServerAccessLogsBucket: CfnBucket;
    s3ServiceCatalogArtifactsBucket: IBucket,
}

export class ServiceCatalogStack extends Stack {
    constructor(scope: Construct, id: string, props: ServiceCatalogStackProps) {
        super(scope, id, props);

        // Portfolio
        const secureCatalogPortfolio = new Portfolio(this, "SecureCatalogPortfolio", {
            displayName: "Secure Portfolio",
            providerName: "Operations Team",
            description: "ServiceCatalog portfolio which contains secure products.",
        });

        Tags.of(secureCatalogPortfolio).add("Solution", props.prefixSolution);
        Tags.of(secureCatalogPortfolio).add("FriendlyName", "Secure ServiceCatalog Portfolio");
        Tags.of(secureCatalogPortfolio).add("Description", `ServiceCatalog portfolio which contains secure products.`);

        const productS3SecureBucket = new ServiceCatalogProduct(this, "ProductS3SecureBucket", {
            templateUrl: `https://${props.s3ServiceCatalogArtifactsBucket.bucketRegionalDomainName}/s3-secure-bucket-product.template`,
            prefixSolution: props.prefixSolution,
            productDescription: "S3 bucket with logging enabled.",
            productName: "S3 Secure Bucket",
            productOwner: "Operations Team",
            provisioningDescription: "S3 bucket with logging and security controls.",
            provisioningName: "1.1",
            branchRepository: props.branchRepository,
        });

        new CfnPortfolioProductAssociation(this, 'ProductS3SecureBucketAssociation', {
            portfolioId: secureCatalogPortfolio.portfolioId,
            productId: productS3SecureBucket.product.ref
        });

        const productEC2Secure = new ServiceCatalogProduct(this, "ProductEC2Secure", {
            templateUrl: `https://${props.s3ServiceCatalogArtifactsBucket.bucketRegionalDomainName}/ec2-secure-product.template`,
            prefixSolution: props.prefixSolution,
            productDescription: "Secure EC2 instance with logging and patching enabled.",
            productName: "Secure EC2 Linux instance",
            productOwner: "Operations Team",
            provisioningDescription: "Secure EC2 instance with logging and patching enabled.",
            provisioningName: "1.0",
            branchRepository: props.branchRepository,
        });

        new CfnPortfolioProductAssociation(this, 'ProductEC2SecureAssociation', {
            portfolioId: secureCatalogPortfolio.portfolioId,
            productId: productEC2Secure.product.ref
        });

        const productVPCSecure = new ServiceCatalogProduct(this, "ProductVPCSecure", {
            templateUrl: `https://${props.s3ServiceCatalogArtifactsBucket.bucketRegionalDomainName}/vpc-secure-product.template`,
            prefixSolution: props.prefixSolution,
            productDescription: "Secure VPC with public and private AZs and Flow Logs enabled.",
            productName: "Secure VPC Public/Private in 2 AZs",
            productOwner: "Operations Team",
            provisioningDescription: "Secure VPC with public and private AZs and Flow Logs enabled.",
            provisioningName: "1.0",
            branchRepository: props.branchRepository,
        });

        new CfnPortfolioProductAssociation(this, 'ProductVPCSecureAssociation', {
            portfolioId: secureCatalogPortfolio.portfolioId,
            productId: productVPCSecure.product.ref
        });

        const productVPCNoInternetSecure = new ServiceCatalogProduct(this, "ProductVPCNoInternetSecure", {
            templateUrl: `https://${props.s3ServiceCatalogArtifactsBucket.bucketRegionalDomainName}/vpc-secure-nointernet-product.template`,
            prefixSolution: props.prefixSolution,
            productDescription: "Secure VPC with private AZs and Flow Logs enabled.",
            productName: "Secure VPC Private Subnets in 2 AZs",
            productOwner: "Operations Team",
            provisioningDescription: "Secure VPC with private AZs and Flow Logs enabled.",
            provisioningName: "1.0",
            branchRepository: props.branchRepository,
        });

        new CfnPortfolioProductAssociation(this, 'ProductVPCNoInternetSecureAssociation', {
            portfolioId: secureCatalogPortfolio.portfolioId,
            productId: productVPCNoInternetSecure.product.ref
        });

        const productS3CloudFrontSecureBucket = new ServiceCatalogProduct(this, "ProductS3CloudFrontSecureBucket", {
            templateUrl: `https://${props.s3ServiceCatalogArtifactsBucket.bucketRegionalDomainName}/cloudfront-s3-product.template`,
            prefixSolution: props.prefixSolution,
            productDescription: "S3 CloudFront bucket with logging enabled.",
            productName: "S3CloudFront Secure Bucket",
            productOwner: "Operations Team",
            provisioningDescription: "S3 CloudFront bucket with logging and security controls.",
            provisioningName: "1.4",
            branchRepository: props.branchRepository,
        });

        new CfnPortfolioProductAssociation(this, 'ProductS3CloudFrontSecureBucketAssociation', {
            portfolioId: secureCatalogPortfolio.portfolioId,
            productId: productS3CloudFrontSecureBucket.product.ref
        });

        // Cfn Outputs
        new CfnOutput(this, "ProductS3SecureBucketCfnOuput", {
            value: productS3SecureBucket.product.attrProvisioningArtifactIds,
            description: "Provisioning artifact IDs of the S3 secure bucket product.",
            exportName: "ProductS3SecureBucketProvisioningArtifactIds",
        });

        new CfnOutput(this, "ProductEC2SecureCfnOuput", {
            value: productEC2Secure.product.attrProvisioningArtifactIds,
            description: "Provisioning artifact IDs of the EC2 secure instance product.",
            exportName: "ProductEC2SecureProvisioningArtifactIds",
        });

        new CfnOutput(this, "ProductVPCSecureCfnOuput", {
            value: productVPCSecure.product.attrProvisioningArtifactIds,
            description: "Provisioning artifact IDs of the VPC secure product.",
            exportName: "ProductVPCSecureProvisioningArtifactIds",
        });

        new CfnOutput(this, "ProductVPCNoInternetSecureCfnOuput", {
            value: productVPCNoInternetSecure.product.attrProvisioningArtifactIds,
            description: "Provisioning artifact IDs of the VPC No Internet secure product.",
            exportName: "ProductVPCNoInternetSecureProvisioningArtifactIds",
        });

        new CfnOutput(this, "ProductS3CloudFrontSecureBucketCfnOuput", {
            value: productS3CloudFrontSecureBucket.product.attrProvisioningArtifactIds,
            description: "Provisioning artifact IDs of the S3 CloudFront secure bucket product.",
            exportName: "ProductS3CloudFrontSecureBucketProvisioningArtifactIds",
        });
    }
}