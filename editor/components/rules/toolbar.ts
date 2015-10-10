import {Component, View} from 'angular2/angular2';

let toolbarTemplate = require<string>('./toolbar.html');
let toolbarCss = require<Webpack.Scss>('./toolbar.scss');

@Component({
    selector: 'rule-editor-toolbar'
})
@View({
    templateUrl: toolbarTemplate,
    styles: [toolbarCss.toString()]
})
export class RuleEditorToolbar {


}
