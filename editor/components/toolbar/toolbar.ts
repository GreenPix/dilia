import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {Location, Router, RouterLink} from 'angular2/router';
import {HttpService} from '../../services/index';
import {SERVICE_DIRECTIVES} from '../../services/directives';


let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<Webpack.Scss>('./toolbar.scss');

@Component({
    selector: 'rule-editor-toolbar'
})
@View({
    templateUrl: toolbarTemplate,
    styles: [toolbarCss.toString()],
    directives: [CORE_DIRECTIVES, SERVICE_DIRECTIVES, RouterLink]
})
export class RuleEditorToolbar {

    constructor(
        private router: Router,
        private location: Location,
        private http: HttpService) {}

    isLoginPage(): boolean {
        return this.location.path() === '/login';
    }

    logout(): void {
        this.http.post('/api/logout')
            .subscribe(res => {
                this.router.navigate(['/Login']);
            });
    }
}
