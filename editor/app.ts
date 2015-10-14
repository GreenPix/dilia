import {Component, View} from 'angular2/angular2';
import {RouteConfig, ROUTER_DIRECTIVES, Router, Location} from 'angular2/router';
import {MapEditor} from './components/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './components/rules/editor';


let appTemplate = require<string>('./app.html');

@Component({
    selector: 'app'
})
@View({
    templateUrl: appTemplate,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '/login', component: LoginForm, as: 'Login' },
    { path: '/map-editor', component: MapEditor, as: 'MapEditor' },
    { path: '/rule-editor', component: RuleEditor, as: 'RuleEditor' },
    { path: '/', redirectTo: '/login', as: 'Home' }
])
export class App {
    router: Router;
    location: Location;

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
    }
}
