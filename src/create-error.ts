import { NodePath   } from '@babel/traverse';
import { MacroError } from 'babel-plugin-macros';

export function createError(path: NodePath, message: string) {
    return path.buildCodeFrameError(message, MacroError);
}
