import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { cdkLambdaRuntimeHack } from '../';

test('default export works for cdkv2', () => {
    const stack = new cdk.Stack();
    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });
});
