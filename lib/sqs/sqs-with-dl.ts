import { Construct, Duration, StackProps, Tags } from "@aws-cdk/core";
import { Queue, IQueue, QueueEncryption } from "@aws-cdk/aws-sqs";
import { TreatMissingData } from "@aws-cdk/aws-cloudwatch";
import { CdkPipelineStackProps } from "../cdk-secure-service-catalog-stack";

const DEFAULT_ALARM_THRESHOLD = 5;

export interface SqsQueueWithDeadletterProps extends CdkPipelineStackProps {
    queueName: string;
    retentionQueue?: Duration;
    visibilityTimeoutQueue?: Duration;
    retentionDlq?: Duration;
    visibilityTimeoutDlq?: Duration;
}

export class SqsQueueWithDeadletter extends Construct {
    public readonly queue: IQueue;
    public readonly deadletterQueue: IQueue;

    constructor(parent: Construct, name: string, props: SqsQueueWithDeadletterProps) {
        super(parent, name);

        this.deadletterQueue = new Queue(this, "deadletterQueue", {
            encryption: QueueEncryption.KMS_MANAGED,
            queueName: `${props.prefixSolution}-${props.queueName}-dl`,
            retentionPeriod: props.retentionDlq ?? Duration.days(14),
            visibilityTimeout: props.visibilityTimeoutDlq ?? Duration.seconds(30)
        });

        Tags.of(this.deadletterQueue).add("Solution", props.prefixSolution);
        Tags.of(this.deadletterQueue).add("FriendlyName", `${props.queueName}-dl`);
        Tags.of(this.deadletterQueue).add("Description", `DLQ for ${props.queueName}.`);

        this.queue = new Queue(this, "queue", {
            deadLetterQueue: {
                maxReceiveCount: 5,
                queue: this.deadletterQueue,
            },
            encryption: QueueEncryption.KMS_MANAGED,
            queueName: `${props.prefixSolution}-${props.queueName}`,
            retentionPeriod: props.retentionQueue ?? Duration.days(5),
            visibilityTimeout: props.visibilityTimeoutQueue ?? Duration.seconds(30),
        });

        Tags.of(this.deadletterQueue).add("Solution", props.prefixSolution);
        Tags.of(this.deadletterQueue).add("FriendlyName", props.queueName);
        Tags.of(this.deadletterQueue).add("Description", `SQS Queue ${props.queueName}.`);        
    }
}