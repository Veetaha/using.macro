import { createMacro } from 'babel-plugin-macros';

import { createUsingMacro, createMethodCallFactory } from './create-using-macro';

interface IDeletable {
    delete(): void;
}
type UsingFn = <T extends IDeletable>(val: T) => T;

export declare const using: UsingFn;

/**
 * This is not a runtime function!
 *
 * This is a babel macro (depends on `babel-plugin-macros`) that turns this code:
 * ```ts
 * import using from 'using.macro';
 *
 * const resource = using( new Resource() );
 * using ( new AutoVarResource() );
 * doStuffWithResource(resource);
 * ```
 * into this:
 * ```ts
 * const resource = new Resource();
 * try {
 *     const _handle = new AutoVarResource(); // variable is created for you
 *     try {
 *         doStuffWithResource(resource);
 *     } finally {
 *         _handle.delete(); // this part is fully customizable!
 *     }
 * } finally {
 *     resource.delete();    // this part is fully customizable!
 * }
 * ```
 */
export default createMacro<UsingFn>(createUsingMacro(createMethodCallFactory('delete')));
