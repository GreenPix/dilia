import {Component} from '@angular/core';
import {Router, ROUTER_DIRECTIVES} from '@angular/router';
import {CORE_DIRECTIVES} from '@angular/common';
import {Location} from '@angular/common';
import {RuleEditorToolbar} from './components/toolbar/toolbar';


let appTemplate = require<string>('./app.html');
let appCss = require<Webpack.Scss>('./app.scss');

@Component({
    selector: 'app',
    templateUrl: appTemplate,
    styles: [appCss.toString()],
    directives: [CORE_DIRECTIVES, RuleEditorToolbar, ROUTER_DIRECTIVES]
})
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
