const path = require('path');

const webpackMerge = require('webpack-merge');
const commonConfig = require('./common');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
const DedupePlugin = require('webpack/lib/optimize/DedupePlugin');

const outputDir = path.join(path.dirname(__dirname), '/build/public/');

module.exports = webpackMerge(commonConfig, {
    debug: false,
    devtool: 'source-map',
    output: {
        path: outputDir,
        filename: 'js/[name].[chunkhash].js',
        sourceMapFilename: 'js/[name].[chunkhash].bundle.map',
        chunkFilename: 'js/[id].[chunkhash].chunk.js'
    },
    plugins: [
        new DedupePlugin(),
        new DefinePlugin({
            VERSION: "1.0",
            IS_PRODUCTION: true
        }),
        new UglifyJsPlugin({
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
        }),
    ]
});
