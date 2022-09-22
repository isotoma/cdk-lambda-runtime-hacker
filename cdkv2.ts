import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface LambdaRuntimeHackMap {
    runtimeFrom: lambda.Runtime;
    runtimeTo: lambda.Runtime;
}

export interface LambdaRuntimeHackProps {
    maps: Array<LambdaRuntimeHackMap>;
}

const fixConstructIfRequired = (construct: Construct, props: LambdaRuntimeHackProps): void => {
    for (const map of props.maps) {
        if (construct instanceof lambda.CfnFunction) {
            if (construct.runtime === map.runtimeFrom.toString()) {
                construct.addPropertyOverride('Runtime', map.runtimeTo.toString());
            }
        } else if (construct instanceof cdk.CfnResource && construct.cfnResourceType === 'AWS::Lambda::Function') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (construct.cfnProperties.Runtime === map.runtimeFrom.toString()) {
                construct.addPropertyOverride('Runtime', map.runtimeTo.toString());
            }
        }
    }
};

export const cdkLambdaRuntimeHack = (construct: Construct, props: LambdaRuntimeHackProps): void => {
    fixConstructIfRequired(construct, props);
    for (const con of construct.node.children) {
        cdkLambdaRuntimeHack(con, props);
    }
};
