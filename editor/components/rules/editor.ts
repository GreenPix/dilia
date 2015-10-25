
import {Component, View, AfterViewInit, CORE_DIRECTIVES} from 'angular2/angular2';
import {ROUTER_DIRECTIVES, RouteConfig} from 'angular2/router';
import {UniqueId, HttpService, SocketIOService} from '../../services/index';
import {AaribaScriptSettings} from '../../models/user';
import {AaribaScriptTextMode} from './ace';
import {AaribaInterpreter, AaribaScriptError} from '../../rules/parser';
import {RuleEditorGlobals} from './globals';
import {RuleEditorExec} from './exec';

let ruleEditorTemplate = require<string>('./editor.html');
let ruleEditorCss = require<string>('./editor.css');

@Component({
    selector: 'rule-editor'
})
@View({
    styles: [ruleEditorCss],
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES, RuleEditorExec, RuleEditorGlobals],
    templateUrl: ruleEditorTemplate
})
export class RuleEditor implements AfterViewInit {

    id: string;
    file_list: Array<{ name: string, active: boolean }>;
    text_area_width: number;
    text_area_height: number;
    editor: AceAjax.Editor;

    constructor(
        id: UniqueId,
        private settings: AaribaScriptSettings,
        private http: HttpService,
        private socket: SocketIOService)
    {
        this.id = id.get();
        this.file_list = [
            { name: "test", active: true },
            { name: "hello world", active: false },
            { name: "foobar", active: false }
        ];
        this.text_area_width = 500;
        this.text_area_height = 400;
    }

    open(event: Event, filename: string) {
        event.preventDefault();
        console.log(filename);
    }

    afterViewInit(): void {
        this.editor = ace.edit(this.id);
        this.editor.setReadOnly(true);
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
        // this.getLastUsedResources();
    }

    private getLastUsedResources(): void {
        this.http.get('/api/user/lastusedresources')
            .map(res => <any>res.json())
            .subscribe(res => {

            });
    }

    private listenToChange(): void {
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
