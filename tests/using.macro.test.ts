/// <reference path="../src/ambient-declarations/babel-plugin-tester.d.ts" />
/// <reference path="../src/ambient-declarations/babel-plugin-macros.d.ts" />

import pluginTester, { TestObject } from 'babel-plugin-tester';
import plugin       from 'babel-plugin-macros';

function format(str: string) {
    return str.replace(/\s+|"use strict";/g, ' ').trim();
}
function code(arr: TemplateStringsArray, ...params: any[]) {
    return format(params.reduce((acc, val, i) => `${acc}${val}${arr[i + 1]}`, arr[0]));
}

const using = `const using = require('../build/using.macro');`;

function test(testObj: TestObject) {
    pluginTester({
        plugin,
        babelOptions: {
            filename: __filename,
        },
        formatResult(result: string) {
            return format(result);
        },
        tests: testObj
    });
}

test({
    'adds one delete statement after using without further statements': {
        code: code`${using}
            const v = using( 23 );
        `,
        output: code`
            const v = 23;
            v.delete();
        `
    },
    'creates variable if not assigned to one': {
        code: code`${using}
            using(42);
        `,
        output: code`
            const _handle = 42;
            _handle.delete();
        `
    },
    'adds try-finally wrapping next statement when it is present': {
        code: code`${using}
            const v = using( 23 );
            expressionStatement();
        `,
        output: code`
            const v = 23;
            try { expressionStatement(); } finally { v.delete(); }
        `
    },
    'works inside of function declaration scope': {
        code: code`${using}
            function fn() {
                using(42);
            }
        `,
        output: code`
            function fn() {
                const _handle = 42;
                _handle.delete();
            }
        `
    },
    'works inside of function expression scope': {
        code: code`${using}
            (function () {
                using(42);
            });
        `,
        output: code`
            (function () {
                const _handle = 42;
                _handle.delete();
            });
        `
    },
    'works inside of arrow function scope': {
        code: code`${using}
            () => {
                using(42);
            };
        `,
        output: code`
            () => {
                const _handle = 42;
                _handle.delete();
            };
        `,
    },
    'works when multiple using in one scope': {
        code: code`${using}
            using(42);
            1;
            using(43);
            2;
            using(44);
        `,
        output: code`
            const _handle3 = 42;
            try {
                1;
                const _handle2 = 43;
                try {
                    2;
                    const _handle = 44;
                    _handle.delete();
                } finally {
                    _handle2.delete();
                }
            } finally {
                _handle3.delete();
            }
        `
    },
    'throws when used with destructuring initialization': {
        code: code`${using}
            const { a, b } = using(42);
        `,
        error: /call expression is only permitted near simple single variable identifier declaration/
    },
    'throws when used near multi-var-decl': {
        code: code`${using}
            const v = using( 32 ), a = 42;
        `,
        error: /call expression is not permitted near multiple variable declarators/
    },
    'throws when not used in call expr': {
        code: code`${using}
            using;
        `,
        error: /is only allowed in a call expression/
    },
    'throws when not used near vardecl or as expression statement': {
        code: code`${using}
            () => using(42);
        `,
        error: /near variable declaration or as a single expression statement/
    },
    'throws when used inside of bare switch statement not enclosed into block statement': {
        code: code`${using}
            switch (42) {
                case 42: using(42);
            }
        `,
        error: /macro is not allowed inside of a bare switch-case/
    },
    "throws on zero parameters": {
        code: code`${using}
            using();
        `,
        error: /expects exactly 1 parameter, but got 0 instead/
    },
    "throws on 2+ parameters": {
        code: code`${using}
            using(42, 43);
        `,
        error: /expects exactly 1 parameter, but got 2 instead/
    },
    "throws on spread element": {
        code: code`${using}
            using(...spread);
        `,
        error: /macro accepts only one parameter without spread elements/
    }
});

