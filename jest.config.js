module.exports = {
    preset: "ts-jest",
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.test.json'
        }
    },
    moduleFileExtensions: [ "ts", "js" ],
    testRegex: ".*\\.test\\.ts$",
    coverageDirectory: "coverage",
    testEnvironment: "node",
    collectCoverage: true
};
