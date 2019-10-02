declare module 'babel-plugin-tester' {

    export interface BabelPluginTesterOpts {
        /** Your babel plugin. */
        plugin: (babel: typeof import('@babel/core'), state: any) => any;
        /** 
         *  This is used for the describe title as well as the test titles. 
         *  If it can be inferred from the plugin's name then it will be and you
         *  don't need to provide this option. 
         */
        pluginName?: string;
        /**
         * This can be used to pass options into your plugin at transform time. 
         * This option can be overwritten using the test object.
         */
        pluginOptions?: any;
        /**
         * To use babel.config.js instead of .babelrc, set babelOptions to the config object.
         */
        babelOptions?: any;
        /**
         * This can be used to specify a title for the describe block (rather than using the pluginName).
         */
        title?: string;
        /**
         * Relative paths from the other options will be relative to this. 
         * Normally you'll provide this as filename: __filename. 
         * The only options property affected by this value is fixtures. 
         * Test Object properties affected by this value are: fixture and outputFixture. 
         * If those properties are not absolute paths, then they will be path.joined 
         * with path.dirname of the filename.
         */
        filename?: string;
        /**
         * This is used to control which line endings the output from babel should have
         */
        endOfLine?: 'lf' | 'crlf' | 'auto' | 'preserve';
        /**
         * This is a path to a directory with this format:
         * 
         *   __fixtures__
         *   ├── first-test # test title will be: "first test"
         *   │   ├── code.js # required
         *   │   └── output.js # required
         *   └── second-test
         *       ├── .babelrc # optional
         *       ├── options.json # optional
         *       ├── code.js
         *       └── output.js
         *
         *   With this you could make your test config like so:
         * ```ts
         * pluginTester({
         *     plugin,
         *     fixtures: path.join(__dirname, '__fixtures__'),
         * })
         * ```
         * And it would run two tests. One for each directory in __fixtures__, 
         * with plugin options set to the content of options.json
         *
         * Options are inherited, placing a options.json file in __fixtures__ 
         * would add those options to all fixtures.
         */
        fixtures?: string;
        /**
         * You provide test objects as the tests option to babel-plugin-tester. 
         * You can either provide the tests as an object of test objects or an array of test objects.
         * If you provide the tests as an object, the key will be used as the title of the test.
         * If you provide an array, the title will be derived from it's index 
         * and a specified title property or the pluginName.
         */
        tests?: TestObject;
        /**
         * Use this to provide your own implementation of babel. 
         * This is particularly useful if you want to use a different version of babel 
         * than what's included in this package.
         */
        babel?: typeof import('@babel/core');
        /**
         * If you'd prefer to take a snapshot of your output rather than compare it 
         * to something you hard-code, then specify snapshot: true. 
         * This will take a snapshot with both the source code and the output, 
         * making the snapshot easier to understand.
         * Only works with jest (jest snapshots).
         */
        snapshot?: boolean;
        /**
         * The rest of the options you provide will be 
         * `lodash.merge`d with each test object. Read more about those next!
         */
        [rest: string]: any;
    }

    export type TestObject = string | { [testName: string]: CodeObj};
    export interface CodeObj {
        /**
         * The code that you want to run through your babel plugin. 
         * This must be provided unless you provide a fixture instead. 
         * If there's no output or outputFixture and snapshot is not true, 
         * then the assertion is that this code is unchanged by the plugin.
         */
        code: string;
        /**
         * If provided, this will be used instead of the pluginName. 
         * If you're using the object API, then the key of this object will be
         * the title.
         */
        title?: string;
        /**
         * If this is provided, the result of the plugin will be compared 
         * with this output for the assertion. It will have any indentation 
         * stripped and will be trimmed as a convenience for template literals.
         */
        output?: any;
        /**
         * If you'd rather put your code in a separate file, you can specify a filename here. 
         * If it's an absolute path, that's the file that will be loaded, otherwise, 
         * this will be path.joined with the filename path.
         */
        fixture?: string;
        /**
         * If you'd rather put your output in a separate file, you can specify 
         * this instead (works the same as fixture).
         */
        outputFixture?: string;
        /**
         * To run only this test. Useful while developing to help focus on a single test. 
         * Can be used on multiple tests.
         */
        only?: unknown;
        /**
         * To skip running this test. Useful for when you're working on a
         * feature that is not yet supported.
         */
        skip?: unknown;
        /**
         * If you'd prefer to take a snapshot of your output rather than compare it 
         * to something you hard-code, then specify snapshot: true. 
         * This will take a snapshot with both the source code and the output, 
         * making the snapshot easier to understand.
         * Only works with jest (jest snapshots).
         */
        snapshot?: boolean;
        /**
         * If a particular test case should be throwing an error, 
         * you can that using one of the following.
         */
        error?: boolean | string | RegExp | (new () => any) | ((err: any) => void);
        /**
         * IF you need something set up before a particular test is run, you can do this with setup. 
         * This function will be run before the test runs. 
         * It can return a function which will be treated as a teardown function. 
         * It can also return a promise.
         * If that promise resolves to a function, that will be treated as a teardown function.
         */
        setup?: (() => void | (() => void)) | Promise<unknown>;
        /**
         * If you set up some state, it's quite possible you want to tear it down. 
         * You can either define this as its own property, or you can return it from the setup function. 
         * This can likewise return a promise if it's asynchronous.
         */
        teardown?: () => void | Promise<unknown>;
        /**
         * This is a function and if it's specified, it allows you to format 
         * the result however you like. The use case for this originally was 
         * for testing codemods and formatting their result with prettier-eslint.
         */
        formatResult?: (result: string) => void;
    }

    export default function(opts: BabelPluginTesterOpts): void;
}
