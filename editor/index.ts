import {HTTP_PROVIDERS} from 'angular2/http';
import {bootstrap, bind} from 'angular2/angular2';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {UniqueId, HttpService, SocketIOService} from './services/index';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';
import {FileManager} from './models/scripting';

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    HttpService,
    SocketIOService,
    FileManager,
    bind(User).toValue(User.default()),
    bind(AaribaScriptSettings).toFactory(user => user.aaribaScriptSettings, [User]),
    bind(UniqueId).toFactory(() => new UniqueId()),
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);
