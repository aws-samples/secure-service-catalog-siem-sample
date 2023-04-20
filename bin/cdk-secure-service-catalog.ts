#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkPipelineStack } from '../lib/cdk-secure-service-catalog-stack';
import { config } from 'dotenv';

config();

const app = new cdk.App();
new CdkPipelineStack(app, 'CdkPipelineStack', {
  stackName: `${process.env.PREFIX_SOLUTION ?? 'aws-ssc'}-main`,
  description: `Main stack for ${process.env.PREFIX_SOLUTION ?? 'aws-ssc'} solution.`,
  branchRepository: process.env.BRANCH_REPO ?? "main",
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  prefixSolution: process.env.PREFIX_SOLUTION ?? 'aws-ssc',
});
