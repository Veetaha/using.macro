import { createMacro } from 'babel-plugin-macros';

import { createUsingMacro, createMethodCallFactory } from './create-using-macro';

interface IDeletable {
    delete(): void;
}
type UsingFn = <T extends IDeletable>(val: T) => T;

export declare const using: UsingFn;

export default createMacro<UsingFn>(createUsingMacro(createMethodCallFactory('delete')));
