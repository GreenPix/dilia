import {Component, View} from 'angular2/angular2';

let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<string>('./toolbar.css');

@Component({
    selector: 'rule-editor-toolbar'
})
@View({
    templateUrl: toolbarTemplate,
    styles: [toolbarCss]
})
export class RuleEditorToolbar {


}
