
import {Component, View, AfterViewInit} from 'angular2/angular2';
import {UniqueId} from '../services/mod';
import {RuleScriptTextMode} from './ace';

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
    editor: AceAjax.Editor;

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    afterViewInit(): void {
        this.editor = ace.edit(this.id);
        this.editor.getSession().setMode(new RuleScriptTextMode());
    }
}
