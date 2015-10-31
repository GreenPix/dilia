
import {Component, View, AfterViewInit, CORE_DIRECTIVES} from 'angular2/angular2';
import {ViewChild} from 'angular2/angular2';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {UniqueId, HttpService, SocketIOService} from '../../services/index';
import {AaribaScriptSettings} from '../../models/user';
import {AaribaScriptTextMode} from './ace';
import {AaribaInterpreter, AaribaScriptError} from '../../rules/parser';
import {FileManager, FileTab} from '../../models/scripting';
import {RuleEditorGlobals} from './globals';
import {RuleEditorExec} from './exec';
import {CommitModal} from './commit';
import {AlertBox} from '../alert/box';

let ruleEditorTemplate = require<string>('./editor.html');
let ruleEditorCss = require<string>('./editor.css');

@Component({
    selector: 'rule-editor'
})
@View({
    styles: [ruleEditorCss],
    directives: [
        CORE_DIRECTIVES, ROUTER_DIRECTIVES,
        CommitModal, AlertBox, RuleEditorExec, RuleEditorGlobals],
    templateUrl: ruleEditorTemplate
})
export class RuleEditor implements AfterViewInit {

    id: string;
    text_area_width: number;
    text_area_height: number;
    editor: AceAjax.Editor;
    interpreter: AaribaInterpreter;

    @ViewChild(CommitModal)
    commit_modal: CommitModal;

    constructor(
        id: UniqueId,
        private settings: AaribaScriptSettings,
        private http: HttpService,
        private socket: SocketIOService,
        private file_manager: FileManager)
    {
        this.id = id.get();
        this.text_area_width = 500;
        this.text_area_height = 400;
        this.interpreter = new AaribaInterpreter();
    }

    open(event: Event, next_file: FileTab) {
        event.preventDefault();

        let content = this.editor.getSession().getValue();
        this.file_manager.open(next_file, content);
        this.setFile(next_file);
    }

    commit(): void {
        if (!this.currentFile().readonly) {
            this.commit_modal.show(this.currentFile());
        }
    }

    currentFile(): FileTab {
        return this.file_manager.currentFile();
    }

    createNewFile(): void {
        let previous_content = this.editor.getSession().getValue();
        let new_file = this.file_manager.createNewFile(previous_content);
        this.setFile(new_file);
    }

    fileList(): Array<FileTab> {
        return this.file_manager.file_list;
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
        this.setFile(this.currentFile());
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
                      type: 'error',
                  }
              ]);
            } else {
              console.error(error);
            }
        }
    }
}
