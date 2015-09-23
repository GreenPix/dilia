import {Component, View} from 'angular2/angular2';

let toolbarTemplate = require<string>('./toolbar.html');

@Component({
    selector: 'rule-editor-toolbar'
})
@View({
    templateUrl: toolbarTemplate
})
export class RuleEditorToolbar {

    
}
