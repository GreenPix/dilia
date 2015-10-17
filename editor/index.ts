import {HTTP_PROVIDERS} from 'angular2/http';
import {bootstrap, bind} from 'angular2/angular2';
import {ROUTER_PROVIDERS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {UniqueId, HttpService} from './services/index';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';

bootstrap(App, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    HttpService,
    bind(User).toValue(User.default()),
    bind(AaribaScriptSettings).toFactory(user => user.aaribaScriptSettings, [User]),
    bind(UniqueId).toFactory(() => new UniqueId()),
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);
