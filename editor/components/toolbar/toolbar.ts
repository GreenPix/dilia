import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {Location} from '@angular/common';
import {AuthService} from '../../services/auth';
import {SERVICE_DIRECTIVES} from '../../services/directives';


let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<Webpack.Scss>('./toolbar.scss');

@Component({
    selector: 'rule-editor-toolbar',
    templateUrl: toolbarTemplate,
    styles: [toolbarCss.toString()],
    directives: [CORE_DIRECTIVES, SERVICE_DIRECTIVES, ROUTER_DIRECTIVES]
})
export class RuleEditorToolbar {

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
