import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Location, Router} from 'angular2/router';
import {HttpService} from '../../services/index';

let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<Webpack.Scss>('./toolbar.scss');

@Component({
    selector: 'rule-editor-toolbar'
})
@View({
    templateUrl: toolbarTemplate,
    styles: [toolbarCss.toString()],
    directives: [CORE_DIRECTIVES]
})
export class RuleEditorToolbar {

    constructor(
        private router: Router,
        private location: Location,
        private http: HttpService) {}

    isLoginPage(): boolean {
        return this.location.path() === "/login";
    }

    logout(): void {
        this.http.post('/api/logout')
            .subscribe(res => {
                this.router.navigate(["/Login"])
            });
    }
}
