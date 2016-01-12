"use strict"

Error.stackTraceLimit = Infinity;
require('phantomjs-polyfill');
require('es6-promise');
require('es6-shim');
require('es7-reflect-metadata/dist/browser');

require('zone.js/lib/browser/zone-microtask.js');
require('zone.js/lib/browser/long-stack-trace-zone.js');
require('zone.js/dist/jasmine-patch.js');

var testContext = require.context('./tests', true, /\.spec\.ts/);
var appContext = require.context('./editor', true, /\.spec\.ts/);

appContext.keys().forEach(appContext);
testContext.keys().forEach(testContext);

var domAdapter = require('angular2/src/platform/browser/browser_adapter');
domAdapter.BrowserDomAdapter.makeCurrent();
