import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';


@Component({
    selector: 'app',
    templateUrl: './app.html',
    styleUrls: [ './app.scss' ],
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
