
import {Component, View, AfterViewInit, NgStyle} from 'angular2/angular2';
import {UniqueId} from '../../services/mod';
import {AaribaScriptSettings} from '../../models/user';
import {AaribaScriptTextMode} from './ace';
import {AaribaInterpreter, AaribaScriptError} from '../../rules/parser';

let ruleEditorTemplate = require<string>('./editor.html');
let ruleEditorCss = require<string>('./editor.css');

@Component({
    selector: 'rule-editor'
})
@View({
    styles: [ruleEditorCss],
    directives: [NgStyle],
    templateUrl: ruleEditorTemplate
})
export class RuleEditor implements AfterViewInit {

    id: string;
    filename: string;
    text_area_width: number;
    text_area_height: number;
    editor: AceAjax.Editor;

    constructor(id: UniqueId, private settings: AaribaScriptSettings) {
        this.id = id.get();
        this.filename = "hello_world.as";
        this.text_area_width = 500;
        this.text_area_height = 400;
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
                this.editor.getSession().clearAnnotations();
                interpreter.reset();
                interpreter.execute(editor.getValue());
            } catch (e) {
                let error: AaribaScriptError = e;
                if (error.line && error.column) {
                  this.editor.getSession().setAnnotations([
                      {
                          row: error.line - 1,
                          column: error.column - 1,
                          text: `${error.name}: ${error.message}`,
                          type: "error",
                      }
                  ]);
                } else {
                  console.error(error);
                }
            }
        });
    }
}
