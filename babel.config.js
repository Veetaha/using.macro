module.exports = { 
    presets: [
        "@babel/typescript"
    ],
    plugins: [
        "closure-elimination",
        "macros",
        "@babel/transform-modules-commonjs",
    ]
};
