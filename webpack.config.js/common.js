
const webpack = require('webpack');
const ForkCheckerPlugin = require('awesome-typescript-loader').ForkCheckerPlugin;

module.exports = {
    // Entry points
    entry: {
        polyfills: './editor/polyfills.ts',
        vendor: './editor/vendor.ts',
        index: './editor/index.ts',
        'libs-free': './editor/libs-free.ts'
    },

    resolve: {
        extensions: ['', '.ts', '.js'],
        root: __dirname,
        modulesDirectories: ['node_modules']
    },

    module: {
        preLoaders: [
            { test: /\.ts$/, loader: 'tslint' }
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
            { test: /\.ts$/,    loader: 'awesome-typescript', exclude: [/\.spec.ts$/] }
        ]
    },

    plugins: [
        new ForkCheckerPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor', 'polyfills'],
            minChunks: Infinity
        }),
    ],

    node: {
        global: 'window',
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};
