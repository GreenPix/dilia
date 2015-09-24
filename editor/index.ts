import {HTTP_BINDINGS} from 'angular2/http';
import {bootstrap, bind} from 'angular2/angular2';
import {ROUTER_BINDINGS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {UniqueId} from './services/mod';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';

require('style!css!normalize.css');

bootstrap(App, [
    ROUTER_BINDINGS,
    HTTP_BINDINGS,
    bind(User).toValue(User.default()),
    bind(AaribaScriptSettings).toFactory(user => user.aaribaScriptSettings, [User]),
    bind(UniqueId).toFactory(() => new UniqueId()),
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);
