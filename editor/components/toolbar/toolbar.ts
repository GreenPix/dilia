import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {Location} from 'angular2/router';

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

    constructor(private location: Location) {}

    isLoginPage(): boolean {
        return this.location.path() === "/login";
    }
}
