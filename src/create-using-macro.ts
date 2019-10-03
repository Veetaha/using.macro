/// <reference path="ambient-declarations/babel-plugin-macros.d.ts" />
/// <reference path="ambient-declarations/for-own.macro.d.ts" />

import own from 'for-own.macro';
import * as T from '@babel/types';
import { MacroFn     } from 'babel-plugin-macros';
import { NodePath    } from '@babel/traverse';

import { getScopeBlock } from './get-scope-block';
import { removeAndNormalizeUsingCallExpr } from './remove-and-normalize-using-call-expr';

export type DestructingStFactory = (garbageId: NodePath<T.Identifier>) => T.Expression | T.Statement | T.Statement[];

/**
 * Creates a macro function for `'babel-plugin-macros'` that implements the logic
 * described in `README.md` of this package.
 * 
 * @param createDestructingCode Function that accepts the garbage variable identifier path
 *                             and returns an expression or a statement or an array
 *                             of statements that implement destructing logic for it
 *                             that will be added into `finally {}` block.
 */
export function createUsingMacro(createDestructingCode: DestructingStFactory): MacroFn {
    return ({references}) => {
        for (const refName in own(references))
        // Iterating backwards in order not to affect other using bindings declared within
        // one scope, so that we only modify statements following the using bindings from
        // the bottom side of the code.
        for (let i = references[refName].length - 1; i >= 0; --i) {
            const {varDecl, varName} = removeAndNormalizeUsingCallExpr(references[refName][i]);

            const scopeBlock     = getScopeBlock(varDecl.scope, refName);
            const nextStatements = varDecl.getAllNextSiblings() as NodePath<T.Statement>[];
            scopeBlock.node.body.splice(+varDecl.key + 1);

            const destrutionStatements = toStatementArray(createDestructingCode(varName));

            if (!nextStatements.length) {
                varDecl.insertAfter(destrutionStatements);
                continue;
            }

            varDecl.insertAfter(T.tryStatement(
                T.blockStatement([]),
                null,
                T.blockStatement(destrutionStatements)
            ));

            const scopeStatements = scopeBlock.get(`body`) as NodePath<T.Statement>[];
            const tryBlockSt = (scopeStatements[+varDecl.key + 1] as NodePath<T.TryStatement>)
                .get(`block`);

            for (const nextStatement of nextStatements) {
                tryBlockSt.node.body.push(nextStatement.node);
                nextStatement.parentPath = tryBlockSt;
            }
        }
    };
}

function toStatementArray(val: T.Expression | T.Statement | T.Statement[]) {
    return (
        Array.isArray(val)  ? val :
        T.isExpression(val) ? [T.expressionStatement(val)] :
        [val]
    );
}

/**
 * Shortcut function that generates `functionName` call for the given garbage identifier.
 * @param functionName Name of the function that will be called on garbage objects
 *                     in output code.
 */
export function createFunctionCallFactory(functionName: string): DestructingStFactory {
    return garbageId => T.callExpression(
        T.identifier(functionName), [garbageId.node]
    );
}

/**
 * Shortcut function that generates `methodName` call on the given garbage identifier.
 * @param functionName Name of the method that will be called on garbage objects
 *                     in output code.
 */
export function createMethodCallFactory(methodName: string): DestructingStFactory {
    return garbageId => T.callExpression(
        T.memberExpression(garbageId.node, T.identifier(methodName)), []
    );
}
