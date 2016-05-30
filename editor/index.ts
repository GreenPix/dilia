import {enableProdMode} from '@angular/core';

if (IS_PRODUCTION) {
    enableProdMode();
}

import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {provide} from '@angular/core';
import {ROUTER_PROVIDERS} from '@angular/router-deprecated';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {UniqueId, HttpService, SocketIOService} from './services/index';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';
import {FileManager} from './models/scripting';
import {MapManager} from './models/map';

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    HttpService,
    SocketIOService,
    FileManager,
    MapManager,
    provide(User, { useValue: User.default() }),
    provide(AaribaScriptSettings, { useFactory: user => user.aaribaScriptSettings, deps: [User] }),
    provide(UniqueId, { useFactory: () => new UniqueId() }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);
