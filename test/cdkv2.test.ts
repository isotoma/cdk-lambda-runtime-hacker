import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Template } from 'aws-cdk-lib/assertions';
import { cdkLambdaRuntimeHack } from '../cdkv2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as sns from 'aws-cdk-lib/aws-sns';

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

const toTemplate = (stack: cdk.Stack): Template => {
    if (!cdk.Stage.isStage(stack.node.root)) {
        throw new Error('Stack must be part of a Stage');
    }
    // Need to do this to ensure the stack is re-synthesized
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    stack.node.root.assembly = undefined;

    return Template.fromStack(stack);
};

test('updates old lambda, 10 to 12', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs10.x',
    });

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs12.x',
    });
});

test('updates old lambda, 10 to 14', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs10.x',
    });

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_14_X,
            },
        ],
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs14.x',
    });
});

test('does not update non-matched lambda', () => {
    const stack = new cdk.Stack();

    new lambda.Function(stack, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.PYTHON_2_7,
        code,
        handler: 'main',
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'python2.7',
    });

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'python2.7',
    });
});

test('handles nested lambda', () => {
    const stack = new cdk.Stack();

    const myConstructA = new Construct(stack, 'A');
    const myConstructB = new Construct(myConstructA, 'B');

    new lambda.Function(myConstructB, 'MyFunction', {
        functionName: 'MyFunction',
        runtime: lambda.Runtime.NODEJS_10_X,
        code,
        handler: 'main',
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs10.x',
    });

    cdkLambdaRuntimeHack(stack, {
        maps: [
            {
                runtimeFrom: lambda.Runtime.NODEJS_10_X,
                runtimeTo: lambda.Runtime.NODEJS_12_X,
            },
        ],
    });

    toTemplate(stack).hasResourceProperties('AWS::Lambda::Function', {
        FunctionName: 'MyFunction',
        Runtime: 'nodejs12.x',
    });
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

    // Different CDK versions use node or Python for this. Regardless,
    // ensure there is no node 10
    toTemplate(stack).resourcePropertiesCountIs(
        'AWS::Lambda::Function',
        {
            FunctionName: 'MyFunction',
            Runtime: 'nodejs10.x',
        },
        0,
    );
});
