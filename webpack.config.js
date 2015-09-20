
var webpack = require('webpack');
var path = require('path');


var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var CommonsChunkPlugin   = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var DedupePlugin   = webpack.optimize.DedupePlugin;
var DefinePlugin   = webpack.DefinePlugin;


var outputDir = path.join(__dirname, '/public/js/');

module.exports = {
    devtool: 'source-map',
    devServer: {
        inline: true,
        colors: true,
        historyApiFallback: true,
        contentBase: 'public/',
        publicPath: '/js/'
    },
    entry: {
        'libs': [
            // Angular 2 Deps
            'rx',
            'zone.js',
            'reflect-metadata',
            'angular2/angular2',
            'angular2/router',
            'angular2/debug',
            'angular2/di'
        ],
        'index': [
            './editor/index.ts'
        ]
    },
    output: {
        path: outputDir,
        filename: '[name].js',
        chunkFilename: '[id].chunk.js',
        sourceMapFilename: '[name].map.js'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.json', '.ts', '.tsx', '.js']
    },
    context: __dirname,
    module: {
        loaders: [

            { test: /\.json$/,  loader: 'json'  },
            { test: /\.css$/,   loader: 'raw'   },
            { test: /\.html$/,  loader: 'url'   },
            { test: /\.pegjs$/, loader: 'pegjs' },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader'
            }
        ]
    },
    noParse: [
        /rtts_assert\/src\/rtts_assert/,
        /reflect-metadata/
    ],
    plugins: [
        new OccurenceOrderPlugin(),
        new DedupePlugin(),
        new CommonsChunkPlugin({
            name: 'libs',
            minChunks: Infinity,
            filename: 'libs.js'
        }),
        new CommonsChunkPlugin({
            name: 'common',
            filename: 'common.js'
        })
    ]
}
