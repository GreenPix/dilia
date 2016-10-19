'use strict';

const path = require('path');

const webpackMerge = require('webpack-merge');
const commonConfig = require('./common');

const ClosureCompPlugin = require('webpack-closure-compiler');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');

const outputDir = path.join(path.dirname(__dirname), '/build/public/');

const config = webpackMerge(commonConfig, {
    debug: false,
    output: {
        path: outputDir,
        filename: 'js/[name].[chunkhash].js',
        sourceMapFilename: 'js/[name].[chunkhash].bundle.map',
        chunkFilename: 'js/[id].[chunkhash].chunk.js'
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'string-replace', query: { search: '@license', replace: '' }},
        ]
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './node_modules/ace-builds/src-min/ace.js',
            to: 'js/ace-min.js'
        }, {
            from: './node_modules/ace-builds/src-min/ext-language_tools.js',
            to: 'js/'
        }]),
        new DefinePlugin({
            VERSION: "1.0",
            IS_PRODUCTION: true,
            process: {
                env: {
                    NODE_ENV: '"production"',
                },
            },
        }),
        {
            apply: (compiler) => compiler.plugin('emit', (compilation, cb) => {
                let packageJson = require('../package.json');
                delete packageJson.devDependencies;
                packageJson.scripts = {
                    start: 'node ./server/server.js'
                };
                let content = JSON.stringify(packageJson, null, 2);
                compilation.assets['../package.json'] = {
                    source: () => content,
                    size: () => content.length,
                };
                cb();
            }),
        }
    ]
});

if (process.argv.indexOf('--closure') !== -1) {
    config.plugins.push(new ClosureCompPlugin({
        compiler: {
            language_in: 'ECMASCRIPT5',
            language_out: 'ECMASCRIPT5',
            compilation_level: 'ADVANCED',
        },
        concurrency: 4,
    }));
} else {
    config.plugins.push(new DedupePlugin());
    config.plugins.push(new UglifyJsPlugin({
        // beautify: true, // debug
        // mangle: false // debug
        // dead_code: false,
        // unused: false,
        // compress: { drop_debugger: false, dead_code: false, unused: false },
        // comments: true
        beautify: false,
        mangle: { screw_ie8: true, keep_fnames: true },
        compress: { screw_ie8: true },
        comments: false
    }));
}

module.exports = config;
