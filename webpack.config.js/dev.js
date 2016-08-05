const path = require('path');

const webpackMerge = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const commonConfig = require('./common');
const DefinePlugin = require('webpack').DefinePlugin;

const outputDir = path.join(path.dirname(__dirname), '/dev/public/');

module.exports = webpackMerge(commonConfig, {
    debug: true,
    devtool: 'source-map',
    devServer: {
        inline: true,
        colors: true,
        historyApiFallback: false,
        contentBase: 'public/',
        publicPath: '/',
        port: 8001,
        proxy: {
            '/api/*': 'http://localhost:8000/',
            '/socket.io/*': 'http://localhost:8000/',
        }
    },
    output: {
        path: outputDir,
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js',
        sourceMapFilename: 'js/[name].map.js'
    },
    plugins: [
        new CopyWebpackPlugin([{
            from: './node_modules/ace-builds/src/ace.js',
            to: 'js/ace-min.js'
        }, {
            from: './node_modules/ace-builds/src/ext-language_tools.js',
            to: 'js/'
        }]),
        new DefinePlugin({
            VERSION: "1.0",
            IS_PRODUCTION: false,
        }),
    ],
});
