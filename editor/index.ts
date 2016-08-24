import {enableProdMode} from '@angular/core';
import {disableDebugTools} from '@angular/platform-browser';

if (IS_PRODUCTION) {
    disableDebugTools();
    enableProdMode();
}

import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {provideRouter} from '@angular/router';
import {provide} from '@angular/core';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {UniqueId, HttpService, SocketIOService} from './services/index';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';
import {FileManager} from './models/scripting';
import {MapManager} from './models/map';
import {AuthGuard} from './permissions/auth';
import {AuthService} from './services/auth';
import {routes} from './routes';

bootstrap(App, [
    HTTP_PROVIDERS,
    provideRouter(routes),
    AuthService,
    AuthGuard,
    HttpService,
    SocketIOService,
    FileManager,
    MapManager,
    provide(User, { useValue: User.default() }),
    provide(AaribaScriptSettings, { useFactory: user => user.aaribaScriptSettings, deps: [User] }),
    provide(UniqueId, { useFactory: () => new UniqueId() }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
])
.catch(err => console.error(err));
