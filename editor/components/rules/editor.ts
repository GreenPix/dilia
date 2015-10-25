
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

interface FileTab {
    index: number;
    content: string;
    name: string;
    active: boolean;
    readonly: boolean;
}

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
    file_list: Array<FileTab>;
    current_file: number;
    text_area_width: number;
    text_area_height: number;
    editor: AceAjax.Editor;
    interpreter: AaribaInterpreter;

    constructor(
        id: UniqueId,
        private settings: AaribaScriptSettings,
        private http: HttpService,
        private socket: SocketIOService)
    {
        this.id = id.get();
        this.current_file = 0;
        this.file_list = [
            { index: 0, name: "test", active: true, readonly: true, content: "" },
            { index: 1, name: "hello world", active: false, readonly: true, content: "" },
            { index: 2, name: "foobar", active: false, readonly: false, content: "" }
        ];
        this.text_area_width = 500;
        this.text_area_height = 400;
        this.interpreter = new AaribaInterpreter();
    }

    open(event: Event, next_file: FileTab) {
        event.preventDefault();

        // Set the previous_file content
        let previous_file = this.file_list[this.current_file];
        previous_file.active = false;
        previous_file.content = this.editor.getValue();

        // Open the next file
        next_file.active = true;
        this.current_file = next_file.index;
        this.setFile(next_file);

        console.log(next_file.name);
    }

    currentFile(): FileTab {
        return this.file_list[this.current_file];
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
        this.editor.addEventListener('change', (action, editor) => {
            this.listenToChange(action, editor);
        });

        // TODO: remove this
        this.setFile(this.file_list[this.current_file]);
        // TODO: and use this instead:
        //this.getLastUsedResources();
    }

    private getLastUsedResources(): void {
        this.http.get('/api/user/lastusedresources')
            .map(res => <any>res.json())
            .subscribe(res => {
                console.log(res);
            });
    }

    private setFile(file: FileTab): void {
        this.editor.getSession().setValue(file.content);
        this.editor.setReadOnly(file.readonly);
        this.listenToChange(null, this.editor);
    }

    private listenToChange(action: any, editor: any): void {
        try {
            this.editor.getSession().clearAnnotations();
            this.interpreter.reset();
            this.interpreter.execute(editor.getValue());
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
    }
}
