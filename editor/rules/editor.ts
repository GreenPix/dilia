
import {Component, View, AfterViewInit} from 'angular2/angular2';
import {UniqueId} from '../services/mod';

let ruleEditorTemplate = require<string>('./editor.html');
let ruleEditorCss = require<string>('./editor.css');

@Component({
    selector: 'rule-editor'
})
@View({
    styles: [ruleEditorCss],
    templateUrl: ruleEditorTemplate
})
export class RuleEditor implements AfterViewInit {

    id: string;

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    afterViewInit(): void {
        ace.edit(this.id);
    }
}
