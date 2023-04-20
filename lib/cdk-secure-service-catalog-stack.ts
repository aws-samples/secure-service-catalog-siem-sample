import { Construct, Stack, StackProps, Tags } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-codecommit";
import { CodeBuildStep, CodePipeline, CodePipelineSource } from "@aws-cdk/pipelines";
import { PolicyStatement } from "@aws-cdk/aws-iam";
import { CdkPipelineDeploymentStage } from "./pipeline/deployment-stage";

export interface CdkPipelineStackProps extends StackProps {
    prefixSolution: string;
    branchRepository?: string;
}

/**
 * The CDK pipeline for the solution.
 */
export class CdkPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props: CdkPipelineStackProps) {
        super(scope, id, props);

        const solutionPrefix = props.prefixSolution ?? process.env.PREFIX_SOLUTION;
        const repoBranch = props.branchRepository ?? process.env.BRANCH_REPO ?? "main";

        // Get a reference to the repository for the solution
        const repo = new Repository(this, "solutionRepository", {
            repositoryName: `${solutionPrefix}-repository`,
            description: `Repository for the solution code of ${solutionPrefix}`,
        });

        // Get a reference to the CodePipeline for the solution
        const pipeline = new CodePipeline(this, "solutionPipeline", {
            pipelineName: `${solutionPrefix}-pipeline`,
            synth: new CodeBuildStep("Synth", {
                input: CodePipelineSource.codeCommit(repo, repoBranch),
                commands: [
                    // NOTE: Other source like Lambdas must be built before CDK synth
                    'cd ./lib/assets',
                    'ls',
                    // Dynamic replacements
                    `sed -i 's/SOLUTION/${solutionPrefix}/g' s3-secure-bucket-product.template`,
                    `sed -i 's/SOLUTION/${solutionPrefix}/g' cloudfront-s3-product.template`,
                    'cd ./../..',
                    // Synthesize the solution
                    'npm ci',
                    'npm run build',
                    'npx cdk synth',
                ],
                primaryOutputDirectory: 'cdk.out',
                env: {
                    "PREFIX_SOLUTION": solutionPrefix,
                    "BRANCH_REPO": repoBranch,
                },
                rolePolicyStatements: [
                    new PolicyStatement({
                      actions: ['sts:AssumeRole'],
                      resources: ['*'],
                      conditions: {
                        StringEquals: {
                          'iam:ResourceTag/aws-cdk:bootstrap-role': 'deploy',
                        },
                      },
                    }),
                    new PolicyStatement({
                        actions: ['ssm:GetParameter'],
                        resources: ['*'],
                    }),
                    new PolicyStatement({
                        actions: ['sts:AssumeRole'],
                        resources: [
                            `arn:aws:iam::${props.env?.account}:role/cdk-*`
                        ]
                    })
                  ],
            }),
            crossAccountKeys: true,
            selfMutation: true,
            publishAssetsInParallel: false
        });

        Tags.of(pipeline).add("Solution", solutionPrefix);

        // Stage: Service Catalog Deployment
        const deploymentStage = new CdkPipelineDeploymentStage(this, 'DeploymentStage', {
            env: props.env,
            prefixSolution: solutionPrefix,
            branchRepository: repoBranch,
        });

        pipeline.addStage(deploymentStage);
    }
}