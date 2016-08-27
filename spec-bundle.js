"use strict"

Error.stackTraceLimit = Infinity;
require('core-js/es6');
require('core-js/es7/reflect');

require('ts-helpers');

require('zone.js/dist/zone');
require('zone.js/dist/long-stack-trace-zone');
require('zone.js/dist/jasmine-patch');
require('zone.js/dist/async-test');
require('zone.js/dist/fake-async-test');
require('zone.js/dist/sync-test');

require('rxjs/Rx');

var testContext = require.context('./tests', true, /\.spec\.ts/);
// var appContext = require.context('./editor', true, /\.spec\.ts/);

testContext.keys().forEach(testContext);
// appContext.keys().forEach(appContext);

var testing = require('@angular/core/testing');
var browser = require('@angular/platform-browser-dynamic/testing');

testing.TestBed.initTestEnvironment(
    browser.BrowserDynamicTestingModule, browser.platformBrowserDynamicTesting()
);
