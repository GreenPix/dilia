import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';


let appTemplate = require<string>('./app.html');
let appCss = require<Webpack.Scss>('./app.scss');

@Component({
    selector: 'app',
    templateUrl: appTemplate,
    styles: [appCss.toString()],
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
