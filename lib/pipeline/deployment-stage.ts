import { Construct, Stage, StageProps, Tags } from "@aws-cdk/core";
import { PrerequisitesStack } from "./../stacks/prerequisites-stack";
import { ServiceCatalogStack } from "./../stacks/service-catalog-stack";

export interface CdkPipelineDeploymentStageProps extends StageProps {
    prefixSolution: string;
    branchRepository?: string;
}

export class CdkPipelineDeploymentStage extends Stage {
    constructor(scope: Construct, id: string, props: CdkPipelineDeploymentStageProps) {
        super(scope, id, props);

        const prerequisitesStack = new PrerequisitesStack(this, "PrerequisitesStack", {
            enableKmsServerAccessLogs: false,
            prefixSolution: props.prefixSolution,
            branchRepository: props.branchRepository,
            env: props.env,
            description: `Deploys prerequisites for ${props.prefixSolution} solution.`,
            stackName: `${props.prefixSolution}-prerequisites`,
        });

        Tags.of(prerequisitesStack).add("Solution", props.prefixSolution);
        Tags.of(prerequisitesStack).add("FriendlyName", "CloudFormation Prerequisites Stack");
        Tags.of(prerequisitesStack).add("Description", `CloudFormation stack to deploy prerequisites for ${props.prefixSolution} solution.`);

        const serviceCatalogStack = new ServiceCatalogStack(this, "ServiceCatalogStack", {
            prefixSolution: props.prefixSolution,
            s3ServerAccessLogsBucket: prerequisitesStack.s3ServerAccessLogsBucket,
            s3ServiceCatalogArtifactsBucket: prerequisitesStack.s3ServiceCatalogSourceBucket,
            branchRepository: props.branchRepository,
            env: props.env,
            description: `Deploys ServiceCatalog resources for ${props.prefixSolution} solution.`,
            stackName: `${props.prefixSolution}-sc`,
        });

        Tags.of(serviceCatalogStack).add("Solution", props.prefixSolution);
        Tags.of(serviceCatalogStack).add("FriendlyName", "CloudFormation ServiceCatalog Stack");
        Tags.of(serviceCatalogStack).add("Description", `Deploys ServiceCatalog resources for ${props.prefixSolution} solution.`);
    }
}