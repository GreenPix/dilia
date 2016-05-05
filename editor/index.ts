import {enableProdMode} from 'angular2/core';

if (IS_PRODUCTION) {
    enableProdMode();
}

import {HTTP_PROVIDERS} from 'angular2/http';
import {bootstrap} from 'angular2/platform/browser';
import {provide} from 'angular2/core';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
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
