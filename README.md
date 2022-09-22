# cdk-lambda-runtime-hacker

[![npm](https://img.shields.io/npm/v/cdk-lambda-runtime-hacker?label=cdk-lambda-runtime-hacker)](https://www.npmjs.com/package/cdk-lambda-runtime-hacker)
[![GitHub package.json dynamic](https://img.shields.io/github/package-json/keywords/isotoma/cdk-lambda-runtime-hacker)](./package.json)
[![NPM](https://img.shields.io/npm/l/cdk-lambda-runtime-hacker)](./LICENSE)

For hacking Lambda runtime versions in CDK

Note that this is definitely not safe in general. You might find that
your code runs fine in the new runtime.

```typescript
import { cdkLambdaRuntimeHack } from 'cdk-lambda-runtime-hacker';

...

const app = new cdk.App();

// Then attach things to app, like stacks, with constructs and Lambda functions

// Then force all uses of node10 Lambda runtimes to become node12, and
// hope that you don't get any bugs
cdkLambdaRuntimeHack(app, {
    maps: [{
        runtimeFrom: lambda.Runtime.NODEJS_10_X,
        runtimeTo: lambda.Runtime.NODEJS_12_X,
    }],
});
```

## CDK v1 and v2

The export from the top level is for CDK v2. However, you can import
an equivalent function that works with CDK v1 as follows:
```typescript
import { cdkLambdaRuntimeHack } from 'cdk-lambda-runtime-hacker/cdkv1';
```

And, for consistency, CDK v2 is available as follows too:
```typescript
import { cdkLambdaRuntimeHack } from 'cdk-lambda-runtime-hacker/cdkv2';
```
