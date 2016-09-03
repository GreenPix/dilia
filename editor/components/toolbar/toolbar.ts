import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {AuthService} from '../../services/auth';


let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<Webpack.Scss>('./toolbar.scss');

@Component({
    selector: 'toolbar',
    templateUrl: toolbarTemplate,
    styles: [toolbarCss.toString()],
})
export class Toolbar {

    constructor(
        private router: Router,
        private location: Location,
        private auth: AuthService
    ) {}

    isLoginPage(): boolean {
        return this.location.path() === '/login';
    }

    logout(): void {
        this.auth.logout().subscribe(res => {
            this.router.navigate(['/login']);
        });
    }
}
