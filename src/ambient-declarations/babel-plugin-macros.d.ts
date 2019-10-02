declare module 'babel-plugin-macros' {
    import Babel, {NodePath} from '@babel/core';

    export class MacroError extends Error { }

    export interface MacroReferences {
        [exportedItemName: string]: NodePath[];
    }

    export interface MacroFnRetObj {
        keepImports: boolean;
    }

    export interface MacroFnParams<TState = any> {
        state:      TState,
        babel:      typeof Babel,
        references: MacroReferences,
        source:     string
    }

    export type MacroFn = <TState = any>(params: MacroFnParams) => void | MacroFnRetObj;

    export interface CreateMacroOpts {
        configName: string;
    }

    export function createMacro<T = any>(macro: MacroFn, opts?: CreateMacroOpts): T;
    export default function (babel: typeof import('@babel/core'), state: any): void;
}
