# Secure Service Catalog Sample with SIEM Integration

[AWS Service Catalog](https://aws.amazon.com/servicecatalog/) lets you centrally manage your cloud resources to achieve governance at scale of your infrastructure as code (IaC) templates, written in CloudFormation or Terraform. With AWS Service Catalog, you can meet your compliance requirements while making sure your customers can quickly deploy the cloud resources they need.

This example uses the [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) to deploy 5 products to the AWS Service Catalog which were created following AWS security best practices. The products are pre-configured to integrate with the [“SIEM on Amazon OpenSearch Service”](https://aws.amazon.com/blogs/security/how-to-use-aws-security-hub-and-amazon-opensearch-service-for-siem/) solution, meaning all logs of resources created by the products are automatically imported and processed by the SIEM.

In addition, this example comes with a [self-updating CDK Pipeline](https://docs.aws.amazon.com/cdk/v2/guide/cdk_pipeline.html) for a painless continuous delivery.

## Included Service Catalog Products

* S3 Secure Bucket - enforced AES256 Server-Side-Encryption and server access logging to SIEM
* S3 + CloudFront Secure Static Hosting - S3 server access logging and CloudFront access logging to SIEM
* Secure EC2 Linux instance - with automatic patching and logging to SIEM
* Secure VPC Private Subnets in 2 AZs - flow logs sent to SIEM
* Secure VPC Public/Private in 2 AZs - flow logs sent to SIEM

## Pre-Requisites

Before deploying this project, make sure you have the [SIEM Solution](https://github.com/aws-samples/siem-on-amazon-opensearch-service) running in your account.
Follow the deployment instructions [here](https://github.com/aws-samples/siem-on-amazon-opensearch-service#1-quick-start). 

## Setup

On your computer, install all npm dependencies by running

```shell
npm i
```

Next, synthesize the CDK solution by running

```shell
npx cdk synth
```

Once you have synthesized the stack, you can bootstrap your AWS environment by running by replacing `<ACCOUNT ID>` with your AWS Account ID and `<region>` with your region:

```shell
npx cdk bootstrap aws://<ACCOUNT ID>/<region>
```

Note, you need to bootstrap every region you plan to use. More information at [https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html).

Now that your AWS Account is bootstrapped, you can perform the initial deployment. Make sure to set the environment variables `PREFIX_SOLUTION` and `BRANCH_REPO` to your unique solution prefix and the appropriate branch in your repository:

```shell
npx cdk deploy
```

Confirm the security information and wait for the stack to be deployed.

The initial deployment will create a CodeCommit repository which will trigger the self-mutating CodePipeline. Either set this CodeCommit repository as your Git origin or mirror a Git repository from GitLab, Git Hub or any other Git provider to CodeCommit.