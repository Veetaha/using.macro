# using.macro

[![Npm](https://img.shields.io/npm/v/using.macro?label=npm%20package&logo=logos&style=for-the-badge)](https://www.npmjs.com/package/using.macro)

[![Babel Macro](https://img.shields.io/badge/babel--macro-%F0%9F%8E%A3-f5da55.svg?style=flat-square)](https://github.com/kentcdodds/babel-plugin-macros)
[![Build Status](https://travis-ci.com/Veetaha/using.macro.svg?branch=master)](https://travis-ci.com/Veetaha/using.macro)
[![Coverage Status](https://coveralls.io/repos/github/Veetaha/using.macro/badge.svg?branch=master)](https://coveralls.io/github/Veetaha/using.macro?branch=master)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)

Just plain old C++ RAII (or C# `using var`) implementation for TypeScipt via [`'babel-plugin-macros'`](https://github.com/kentcdodds/babel-plugin-macros).

## Rationale

Suppose you have a local resource handle that you must manually release in the same
scope.

With this plugin the cleanup is done automatically for you.
```ts
import using from 'using.macro';

const resource = using( new Resource() );
using ( new AutoVarResource() );
doStuffWithResource(resource);

    ↓ ↓ ↓ ↓ ↓ ↓

const resource = new Resource();
try {
    const _handle = new AutoVarResource(); // variable is created for you
    try {
        doStuffWithResource(resource);
    } finally {
        _handle.delete(); // this part is fully customizable!
    }
} finally {
    resource.delete();    // this part is fully customizable!
}
```
## Syntax

The way you import this macro doesn't matter (as long as TypeScript eats it):
```ts
import using from 'using.macro';
import kek   from 'using.macro';
import { using } from 'using.macro';
import { using as kek } from 'using.macro';
```

There are only two options for invoking this macro:

* Near variable declaration `var/let/const varId = using(expresssion);`
* As a single expression statement ` using(expression);` so that a varaible will be created automatically to release it for you.


## Customize

By default when you do 
```ts
import using from 'using.macro';
```
you get `.delete()` method called on your handles.

If you want to change this behaviour to e.g. call `free()` function on your handle, 
you can wrap this macro with your own via `createUsingMacro()` from `'using.macro/create'`:
```ts
// using-ptr.macro.ts  # .macro extension matters! See babel-plugin-macros docs
import { createMacro } from 'babel-plugin-macros';
import { createUsingMacro, createFunctionCallFactory } from 'using.macro/create';

export default createMacro<Fn>(createUsingMacro(createFunctionCallFactory('free')));

// Pass this noop function type to createMacro<>() for TypeScript support.
type Fn = <T>(val: T) => T;
```
and use it in your code this way:
```ts
import usingPtr from './using-ptr.macro';

const ptr = usingPtr ( malloc(42) );
// stuff

    ↓ ↓ ↓ ↓ ↓ ↓

const ptr = malloc(42);
try {
    // stuff
} finally {
    free(ptr);
}
```

`create[Function/Method]CallFactory()` are simply two helper
functions. You can actually pass your own destructor codegen function instead:
```ts
import * as T from '@babel/types'; // default import is not supported by babel!

createUsingMacro(garbageVariableIdentifier => {
    // you may return a simple expression or a statement or an array of statements here
    return T.callExpression(T.identifier('free'), [garbageVariableIdentifier.node]);
})
```

## Caveats

Unfortunately `'babel-plugin-macros'` doesn't currently natively support TypeScript macros
in runtime, so you need to build your custom `*.macro.ts` to `*.macro.js` file,
and put in the same directory as `ts` file.

## References
Originally this macro was created for simplifying the usage of
[`'embind'`](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html) C++ object
handles
