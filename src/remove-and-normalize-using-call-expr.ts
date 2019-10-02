import * as T from '@babel/types';
import { NodePath } from "@babel/traverse";

import { createError } from "./create-error";

export function removeAndNormalizeUsingCallExpr(ref: NodePath<T.Node>) {
    ref.assertIdentifier();
    const id = (ref as NodePath<T.Identifier>).node.name;

    const callExpr = ref.parentPath;
    if (!callExpr.isCallExpression()) throw createError(ref,
        `${id}() is only allowed in a call expression`
    );

    const params = callExpr.get('arguments');

    if (params.length !== 1) throw createError(params[1] || callExpr,
        `${id}() expects exactly 1 parameter, but got ${params.length} instead`
    );

    const handle = params[0];

    if (!handle.isExpression()) throw createError(handle,
        `${id}() macro accepts only one parameter without spread elements`,
    );

    callExpr.replaceWith(handle);

    return getOrCreateUsingVarDecl(callExpr.parentPath, id);
}

function getUsingVarDecl(varDeclarator: NodePath<T.VariableDeclarator>, id: string) {
    const varDecl = varDeclarator.parentPath as NodePath<T.VariableDeclaration>;
    if (varDecl.node.declarations.length !== 1) throw createError(varDecl,
        `${id}() call expression is not permitted near multiple variable declarators`
    );
    const varName = varDeclarator.get('id');
    if (!varName.isIdentifier()) throw createError(varName,
        `${id}() call expression is only permitted near simple single variable identifier declaration`
    );
    return { varDecl, varName };
}

function createUsingVarDecl(usingExprSt: NodePath<T.ExpressionStatement>) {
    usingExprSt.replaceWith(T.variableDeclaration('const', [
        T.variableDeclarator(
            usingExprSt.scope.generateUidIdentifier('handle'),
            usingExprSt.node.expression
        )
    ]));
    const varDecl = usingExprSt as any as NodePath<T.VariableDeclaration>;
    return {
        varDecl,
        varName: varDecl.get('declarations')[0].get('id') as NodePath<T.Identifier>
    };
}

function getOrCreateUsingVarDecl(varDeclaratorOrExprSt: NodePath, id: string) {
    if (varDeclaratorOrExprSt.isVariableDeclarator()) {
        return getUsingVarDecl(varDeclaratorOrExprSt, id);
    }
    if (!varDeclaratorOrExprSt.isExpressionStatement()) throw createError(varDeclaratorOrExprSt,
        `${id}() call expression can only be used as the initializer near variable declaration ` +
        `or as a single expression statement:\n` +
        `const handle = ${id} (createHandle());\n` +
        `${id} (createHandle());`
    );
    return createUsingVarDecl(varDeclaratorOrExprSt);
}
