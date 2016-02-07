import {HTTP_PROVIDERS} from 'angular2/http';
import {bootstrap} from 'angular2/platform/browser';
import {bind} from 'angular2/core';
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
    bind(User).toValue(User.default()),
    bind(AaribaScriptSettings).toFactory(user => user.aaribaScriptSettings, [User]),
    bind(UniqueId).toFactory(() => new UniqueId()),
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);
