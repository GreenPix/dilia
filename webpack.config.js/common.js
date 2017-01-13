
const path = require('path');
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    // Entry points
    entry: {
        polyfills: './editor/polyfills.ts',
        vendor: './editor/vendor.ts',
        index: './editor/index.ts',
        'libs-free': './editor/libs-free.ts'
    },

    resolve: {
        extensions: ['.ts', '.js'],
        modules: [
            path.join(path.dirname(__dirname), 'editor/'),
            'node_modules',
        ]
    },

    module: {
        rules: [
            // Sass / css / fonts
            { test: /\b(?!style)\w+\.scss$/,  use: ['css-loader?sourceMap', 'sass-loader?sourceMap'] },
            { test: /\.eot(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\.otf$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\.ttf(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader?name=fonts/[hash].[ext]' },
            { test: /\b(?!normalize)\w+\.css$/,   loader: 'raw-loader'   },
            // Json / html / pegjs / ts
            { test: /\.pegjs$/, loader: 'pegjs-loader' },
            { test: /\.fs$/,    loader: 'raw-loader'   },
            { test: /\.vs$/,    loader: 'raw-loader'   },
            {
                test: /\.ts$/,
                loader: 'tslint-loader',
                enforce: 'pre',
                exclude: /node_modules/,
            },
            { test: /\.ts$/,
              use: [
                  // { loader: 'ts-loader', options: { configFileName: path.join(path.dirname(__dirname), 'tsconfig.json') } }
                  { loader: 'awesome-typescript-loader' },
                  { loader: 'angular2-template-loader' },
                  { loader: 'angular-router-loader' },
              ]
            }
        ]
    },

    plugins: [
        new CommonsChunkPlugin({
            name: ['vendor', 'polyfills'],
            minChunks: Infinity
        }),
        new HtmlWebpackPlugin({
            template: './editor/index.html',
            chunkSortMode: 'dependency',
            inject: false,
        }),
        new CopyWebpackPlugin([{
            from: 'assets/img',
            to: 'img/',
        }, {
            from: 'assets/fonts',
            to: 'fonts/'
        }]),
    ],

    node: {
        global: true,
        process: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
