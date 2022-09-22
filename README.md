# cdk-lambda-runtime-hacker

For hacking Lambda runtime versions in CDK

Note that this is definitely not safe in general. You might find that
your code runs fine in the new runtime.

```typescript
import { cdkLambdaRuntimeHack } from '../cdkv2';

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
