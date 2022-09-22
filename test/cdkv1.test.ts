import { expect as cdkExpect, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import '@aws-cdk/assert/jest';
import { cdkLambdaRuntimeHack } from '../cdkv1';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3Notifications from '@aws-cdk/aws-s3-notifications';
import * as sns from '@aws-cdk/aws-sns';

test('handles empty stack', () => {
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

const code = new lambda.InlineCode('export const main = () => {}');

test('updates old lambda, 10 to 12', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs10.x',
        }),
    );

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs12.x',
        }),
    );
});

test('updates old lambda, 10 to 14', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs10.x',
        }),
    );

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_14_X,
            },
        ],
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs14.x',
        }),
    );
});

test('does not update non-matched lambda', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.PYTHON_2_7,
        code,
        handler: 'main',
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'python2.7',
        }),
    );

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'python2.7',
        }),
    );
});

test('handles nested lambda', () => {
    const stack = new cdk.Stack();

    const myConstructA = new cdk.Construct(stack, 'A');
    const myConstructB = new cdk.Construct(myConstructA, 'B');

    new lambda.Function(myConstructB, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs10.x',
        }),
    );

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    cdkExpect(stack).to(
        haveResource('AWS::Lambda::Function', {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs12.x',
        }),
    );
});

test('handles s3 notification lambda', () => {
    const stack = new cdk.Stack();

    const bucket = new s3.Bucket(stack, 'MyBucket', {});
    const topic = new sns.Topic(stack, 'MyTopic', {});

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3Notifications.SnsDestination(topic));

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    cdkExpect(stack).notTo(
        haveResource('AWS::Lambda::Function', {
            Runtime: 'nodejs10.x',
        }),
    );
});
