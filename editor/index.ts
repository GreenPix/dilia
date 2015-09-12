import {HTTP_BINDINGS} from 'angular2/http';
import {Component, View, bootstrap, bind} from 'angular2/angular2';
import {ROUTER_BINDINGS, LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {RouteConfig, RouterOutlet, Router, Location} from 'angular2/router';
import {MapEditor} from './map/editor';
import {LoginForm} from './login/form';
import LoggedInService = require('./services/LoggedInService');

let appTemplate = require<string>('./app.html');

@Component({
    selector: 'app'
})
@View({
    templateUrl: appTemplate,
    directives:[RouterOutlet]
})
@RouteConfig([
    { path: '/login', component: LoginForm, as: 'login' },
    { path: '/map-editor', component: MapEditor, as: 'map-editor' },
    { path: '/', redirectTo: 'login', as: 'home' }
])
class App {
    router: Router;
    location: Location;

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
    }
}

bootstrap(App, [
    ROUTER_BINDINGS,
    HTTP_BINDINGS,
    LoggedInService,
    bind(LocationStrategy).toClass(HashLocationStrategy)
]);
