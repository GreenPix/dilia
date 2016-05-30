import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {RouteConfig, ROUTER_DIRECTIVES, Router} from '@angular/router-deprecated';
import {Location} from '@angular/common';
import {MapEditor} from './components/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './components/rules/editor';
import {RuleEditorToolbar} from './components/toolbar/toolbar';
import {Profile} from './components/profile/profile';


let appTemplate = require<string>('./app.html');
let appCss = require<Webpack.Scss>('./app.scss');

@Component({
    selector: 'app',
    templateUrl: appTemplate,
    styles: [appCss.toString()],
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, RuleEditorToolbar]
})
@RouteConfig([
    { path: '/login', component: LoginForm, as: 'Login' },
    { path: '/map-editor', component: MapEditor, as: 'MapEditor' },
    { path: '/rule-editor', component: RuleEditor, as: 'ScriptEditor' },
    { path: '/profile', component: Profile, as: 'Profile' },
    { path: '/', redirectTo: ['./Login'], as: 'Home' }
])
export class App {
    router: Router;
    location: Location;

    constructor(router: Router, location: Location) {
        this.router = router;
        this.location = location;
    }

    shouldLimitWidth(): boolean {
        return this.location.path() === '/login';
    }
}
