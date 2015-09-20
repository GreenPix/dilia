
import {Component, View, AfterViewInit} from 'angular2/angular2';
import {UniqueId} from '../services/mod';
import {AaribaScriptSettings} from '../models/user';
import {AaribaScriptTextMode} from './ace';
import {AaribaInterpreter} from './parser';

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

    constructor(id: UniqueId, private settings: AaribaScriptSettings) {
        this.id = id.get();
    }

    afterViewInit(): void {
        this.editor = ace.edit(this.id);

        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: false,
            enableLiveAutocompletion: false
        });
        this.editor.setFontSize(`${this.settings.fontSize || 24}px`);
        this.editor.setShowInvisibles(this.settings.showInvisibles);
        this.editor.getSession().setMode(new AaribaScriptTextMode());
        this.editor.getSession().setTabSize(2);
        this.editor.getSession().setUseSoftTabs(true);
        let interpreter = new AaribaInterpreter();
        this.editor.addEventListener('change', (action, editor) => {
            try {
                interpreter.reset();
                interpreter.execute(editor.getValue());
            } catch (e) {
                console.error(e.name, e.message);
            }
        });
    }
}
