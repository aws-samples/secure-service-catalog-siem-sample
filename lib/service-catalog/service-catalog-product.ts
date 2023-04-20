import { CfnCloudFormationProduct } from "@aws-cdk/aws-servicecatalog";
import { Construct, StackProps } from "@aws-cdk/core";
import { Asset } from '@aws-cdk/aws-s3-assets';
import { CdkPipelineStackProps } from "./../cdk-secure-service-catalog-stack";

export interface ServiceCatalogProductProps extends CdkPipelineStackProps {
    productName: string;
    productOwner: string;
    productDescription: string;
    provisioningName: string;
    provisioningDescription: string;
    templateUrl: string;
}

export class ServiceCatalogProduct extends Construct {
    public readonly product: CfnCloudFormationProduct;
    constructor(scope: Construct, id: string, props: ServiceCatalogProductProps) {
        super(scope, id);
        
        this.product = new CfnCloudFormationProduct(this, "ServiceCatalogProduct", {
            name: props.productName,
            owner: props.productOwner,
            description: props.productDescription,
            provisioningArtifactParameters: [
                {
                    name: props.provisioningName,
                    description: props.provisioningDescription,
                    info: {
                        LoadTemplateFromURL: props.templateUrl,
                    }
                }
            ],
            tags: [
                {
                    key: "Solution",
                    value: props.prefixSolution
                },
                {
                    key: "FriendlyName",
                    value: `SC Product: ${props.productName}`
                }
            ]
        })
      }
}