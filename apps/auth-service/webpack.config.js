const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join, resolve } = require('path');

module.exports = {
    output: {
        path: resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            "@packages": resolve(__dirname, "../../packages"),
            "@multi-vendor-ecommerce/prisma": resolve(__dirname, "../../packages/libs/prisma/index.ts")
        },
        extensions: [".ts", ".js", ".json"]
    },
    plugins: [
        new NxAppWebpackPlugin({
            target: 'node',
            compiler: 'tsc',
            main: './src/main.ts',
            tsConfig: './tsconfig.app.json',
            optimization: false,
            outputHashing: 'none',
            generatePackageJson: true,

        }),
    ],

};