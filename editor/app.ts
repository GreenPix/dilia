import {Component, View} from 'angular2/angular2';
import {RouteConfig, RouterOutlet, Router, Location} from 'angular2/router';
import {MapEditor} from './components/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './components/rules/editor';


let appTemplate = require<string>('./app.html');

@Component({
    selector: 'app'
})
@View({
    templateUrl: appTemplate,
    directives: [RouterOutlet]
})
@RouteConfig([
    { path: '/login', component: LoginForm, as: 'login' },
    { path: '/map-editor', component: MapEditor, as: 'map-editor' },
    { path: '/rule-editor', component: RuleEditor, as: 'rule-editor' },
    { path: '/', redirectTo: 'login', as: 'home' }
])
export class App {
    router: Router;
    location: Location;

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
    }
}
