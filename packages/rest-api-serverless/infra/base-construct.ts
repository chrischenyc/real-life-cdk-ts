import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BaseConstructProps {
    readonly environment: string;
}

// a base class of customised Construct
export class BaseConstruct extends Construct {
    protected readonly environment: string;
    protected readonly stackName: string;
    protected readonly isProd: boolean;

    constructor(scope: Construct, id: string, props: BaseConstructProps) {
        super(scope, id);

        const { environment } = props;

        this.environment = environment;
        this.stackName = Stack.of(this).stackName;
        this.isProd = environment === 'prod';
    }
}
