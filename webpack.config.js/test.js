
const path = require('path');
const webpackMerge = require('webpack-merge');
const DefinePlugin = require('webpack').DefinePlugin;
const commonConfig = require('./common');

const config = webpackMerge(commonConfig, {
    debug: false,
    devtool: 'inline-source-map',
    entry: {},
    resolve: {
        cache: false
    },
    module: {
        preLoaders: [
          {
              test: /\.js$/,
              loader: 'source-map-loader',
              exclude: [
                  'node_modules/rxjs',
                  'node_modules/@angular'
              ]
          }
        ],
        postLoaders: [
            {
                test: /\.(js|ts)$/,
                loader: 'istanbul-instrumenter',
                include: path.join(path.dirname(__dirname), './editor/'),
                exclude: [ /*/\.spec\.ts$/,*/ /node_modules/ ],
            }
        ],
    },
    output: {},
    bail: true,
});

config.plugins = [
    new DefinePlugin({
        VERSION: "1.0",
        IS_PRODUCTION: false,
    }),
];


module.exports = config;
