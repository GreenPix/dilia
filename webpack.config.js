

var webpack = require('webpack');
var path = require('path');


var OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;
var CommonsChunkPlugin   = webpack.optimize.CommonsChunkPlugin;
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var DedupePlugin   = webpack.optimize.DedupePlugin;
var DefinePlugin   = webpack.DefinePlugin;


var outputDir = path.join(__dirname, '/public/');

module.exports = {
    devtool: 'source-map',
    devServer: {
        inline: true,
        colors: true,
        historyApiFallback: false,
        contentBase: 'public/',
        publicPath: '/',
        port: 8001,
        proxy: {
          '/api/*': 'http://localhost:3000/',
          '/socket.io/': 'http://localhost:3000/',
        }
    },
    entry: {
        'libs': [
            // Angular 2 Deps
            'rxjs',
            'zone.js',
            'reflect-metadata',
            // to ensure these modules are grouped together in one file
            'angular2/platform/browser',
            'angular2/platform/common_dom',
            'angular2/core',
            'angular2/common',
            'angular2/animate',
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
        filename: 'js/[name].js',
        chunkFilename: 'js/[id].chunk.js',
        sourceMapFilename: 'js/[name].map.js'
    },
    resolve: {
        root: __dirname,
        extensions: ['', '.json', '.ts', '.tsx', '.js']
    },
    context: __dirname,
    module: {
      preLoaders: [
        { test: /\.ts$/, loader: 'tslint'}
      ],
      loaders: [
        // Sass / css / fonts
        { test: /\b(?!style)\w+\.scss$/,  loader: 'css?sourceMap!sass?sourceMap' },
        { test: /\.eot(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\.otf$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\.ttf(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file?name=fonts/[hash].[ext]' },
        { test: /\b(?!normalize)\w+\.css$/,   loader: 'raw'   },
        // Json / html / pegjs / ts
        { test: /\.json$/,  loader: 'json'  },
        { test: /\.html$/,  loader: 'url'   },
        { test: /\.pegjs$/, loader: 'pegjs' },
        { test: /\.fs$/,    loader: 'raw'   },
        { test: /\.vs$/,    loader: 'raw'   },
        { test: /\.ts$/,  loader: 'ts' }
      ]
    },
    noParse: [
        /rtts_assert\/src\/rtts_assert/,
        /reflect-metadata/
    ],
    plugins: [
        new DefinePlugin({
            VERSION: 1.0,
            IS_PRODUCTION: false,
        }),
        new OccurenceOrderPlugin(),
        new DedupePlugin(),
        new CommonsChunkPlugin({
            name: 'libs',
            minChunks: Infinity,
            filename: 'js/libs.js'
        }),
        new CommonsChunkPlugin({
            name: 'common',
            filename: 'js/common.js'
        })
    ]
}
