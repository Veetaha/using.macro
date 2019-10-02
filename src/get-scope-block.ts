import * as T from '@babel/types';
import { NodePath, Scope } from "@babel/traverse";

import { createError } from "./create-error";

export type ScopeBlock = NodePath<T.BlockStatement> | NodePath<T.Program> | NodePath<T.TSModuleBlock>;

export function getScopeBlock({path}: Scope, refName: string): ScopeBlock  {
    switch (path.node.type) {
        case 'SwitchStatement': throw createError(path,
            `${refName}() macro is not allowed inside of a bare switch-case, ` +
            `wrap it into a block statement.`,
        );
        case 'BlockStatement':
        case 'Program':
        case 'TSModuleBlock':  return path as ScopeBlock;
        case 'FunctionExpression':
        case 'FunctionDeclaration':
        case 'CatchClause':
        case 'ClassPrivateMethod':
        case 'ClassMethod':
        case 'ObjectMethod': return path.get('body') as NodePath<T.BlockStatement>;
        case 'ArrowFunctionExpression':
        case 'WhileStatement':
        case 'ForStatement':
        case 'ForOfStatement':
        case 'DoWhileStatement':
        case 'ForInStatement': {
            const body = path.get('body') as NodePath;
            if (!body.isBlockStatement()) {
                throw createError(path,
                    'Variable declaration is excepted to occur only inside of a block statement'
                );
            }
            return body;
        }
    }
    throw createError(path, 'Could not find variable scope block');
}
