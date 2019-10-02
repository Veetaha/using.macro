/// <reference path="ambient-declarations/babel-plugin-macros.d.ts" />
/// <reference path="ambient-declarations/for-own.macro.d.ts" />

import own from 'for-own.macro';
import * as T from '@babel/types';
import { MacroFn     } from 'babel-plugin-macros';
import { NodePath    } from '@babel/traverse';

import { getScopeBlock } from './get-scope-block';
import { removeAndNormalizeUsingCallExpr } from './remove-and-normalize-using-call-expr';

export type DestructorCallFactory = (garbageId: NodePath<T.Identifier>) => T.Expression;

export function createUsingMacro(createDestructorCall: DestructorCallFactory): MacroFn {
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

            const destrutionExprSt = T.expressionStatement(createDestructorCall(varName));

            if (!nextStatements.length) {
                varDecl.insertAfter(destrutionExprSt);
                continue;
            }

            varDecl.insertAfter(T.tryStatement(
                T.blockStatement([]),
                null,
                T.blockStatement([destrutionExprSt])
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

export function createFunctionCallFactory(functionName: string): DestructorCallFactory {
    return garbageId => T.callExpression(T.identifier(functionName), [garbageId.node]);
}

export function createMethodCallFactory(methodName: string): DestructorCallFactory {
    return garbageId => T.callExpression(
        T.memberExpression(garbageId.node, T.identifier(methodName)), []
    );
}
