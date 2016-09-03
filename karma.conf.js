'use strict';
// Karma configuration

module.exports = function(config) {
  let configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [ { pattern: 'spec-bundle.js', watched: false } ],

    webpack: require('./webpack.config.js/test.js'),

    webpackServer: {
        noInfo: true,
        stats: 'errors-only'
    },

    coverageReporter: {
        dir: 'coverage/',
        reporters: [
            { type: 'text-summary' },
            { type: 'json' },
            { type: 'html' }
        ]
    },

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { 'spec-bundle.js': ['coverage', 'webpack', 'sourcemap'] },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [/*'PhantomJS'*/, 'Chromium'],

    customLaunchers: {
        PhantomJSDebug: {
            base: 'PhantomJS',
            options: {
                windowName: 'my-window',
                settings: {
                    webSecurityEnabled: false
                },
            },
            flags: ['--load-images=true'],
            debug: true
        },
        ChromiumTravisCI: {
            base: 'Chromium',
            flags: ['--no-sandbox']
        }
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,
  };

  if (process.env.TRAVIS) {
      configuration.browsers = ['ChromiumTravisCI']
  }

  config.set(configuration);
}
