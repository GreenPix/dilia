import {enableProdMode} from '@angular/core';
import {disableDebugTools} from '@angular/platform-browser';

if (IS_PRODUCTION) {
    disableDebugTools();
    enableProdMode();
}

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
