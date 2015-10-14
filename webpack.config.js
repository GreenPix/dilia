
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
        publicPath: '/js/',
        port: 8001
    },
    entry: {
        'libs': [
            // Angular 2 Deps
            '@reactivex/rxjs',
            'zone.js',
            'reflect-metadata',
            // to ensure these modules are grouped together in one file
            'angular2/angular2',
            'angular2/core',
            'angular2/router',
            'angular2/http'
        ],
        'index': [
            './editor/index.ts'
        ],
        'libs-free': [
            './editor/libs-free.ts'
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
        extensions: ['', '.json', '.ts', '.tsx', '.js'],
        alias: {
          'rx': '@reactivex/rxjs'
        }
    },
    context: __dirname,
    module: {
      loaders: [
        // Sass / css / fonts
        { test: /\.scss$/,  loader: 'css?sourceMap!sass?sourceMap' },
        { test: /\.eot/, loader: 'url?limit=100000&mimetype=application/vnd.ms-fontobject' },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=100000&mimetype=application/font-woff2' },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=100000&mimetype=application/font-woff' },
        { test: /\.ttf(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=100000&mimetype=application/font-ttf' },
        { test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url?limit=10000&mimetype=application/svg' },
        { test: /\b(?!normalize)\w+\.css$/,   loader: 'raw'   },
        // Json / html / pegjs / ts
        { test: /\.json$/,  loader: 'json'  },
        { test: /\.html$/,  loader: 'url'   },
        { test: /\.pegjs$/, loader: 'pegjs' },
        { test: /\.tsx?$/,  loader: 'ts' }
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
