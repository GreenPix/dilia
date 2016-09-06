import {Subscription} from 'rxjs/Subscription';
import {Component, AfterViewInit} from '@angular/core';
import {ViewChild} from '@angular/core';
import {UniqueId, HttpService, SocketIOService} from '../../services/index';
import {AaribaScriptSettings} from '../../models/user';
import {AaribaScriptTextMode} from './ace';
import {AaribaInterpreter, AaribaScriptError} from '../../rules/parser';
import {FileManager, FileTab} from '../../models/scripting';
import {AaribaFile} from '../../shared';
import {CommitModal} from '../../components';

let ruleEditorTemplate = require<string>('./editor.html');
let ruleEditorCss = require<Webpack.Scss>('./editor.scss');

@Component({
    selector: 'rule-editor',
    styles: [ruleEditorCss.toString()],
    templateUrl: ruleEditorTemplate,
})
export class RuleEditor implements AfterViewInit {

    id: string;
    text_area_width: number;
    text_area_height: number;
    editor: AceAjax.Editor;
    interpreter: AaribaInterpreter;
    content_observable: Subscription = null;

    @ViewChild('commitscript')
    commit_modal: CommitModal;

    constructor(
        id: UniqueId,
        private settings: AaribaScriptSettings,
        private http: HttpService,
        private io: SocketIOService,
        private file_manager: FileManager)
    {
        this.id = id.get();
        this.text_area_width = 500;
        this.text_area_height = 400;
        this.interpreter = new AaribaInterpreter();
    }

    private cleanPreviousFile() {
        if (this.content_observable) {
            this.content_observable.unsubscribe();
        }
    }

    private obtainLiveContentUpdate(file: { name: string; }) {
        this.content_observable = this.io
            .get<string>(`/api/aariba/${file.name}/liveupdate`)
            .subscribe(res => {
                console.log(res);
                this.editor.getSession().setValue(res);
            });
    }

    open(file: AaribaFile) {

        if (!file) {
            throw new Error(`Tried to open a file with an empty`);
        }

        this.cleanPreviousFile();

        // Is this file already opened in a tab?
        if (this.file_manager.hasFile(file.name)) {

            let content = this.editor.getSession().getValue();
            let active_file = this.file_manager.editFilename(file.name, content);
            this.setFile(active_file);

            return;
        }

        // Read only mode
        if (file.locked) {
            this.obtainLiveContentUpdate(file);

            this.http.get(`/api/aariba/${file.name}`)
                .map(res => res.json() as any)
                .subscribe(script => {
                    let content = this.editor.getSession().getValue();
                    let opened_file = this.file_manager.open(file, script.content, content);
                    this.setFile(opened_file);
                });
        }

        // Otherwise obtain the script content from the server
        else {
            this.http.post(`/api/aariba/${file.name}/lock`)
                .subscribe(res => {
                    if (res.status === 200) {
                        this.http.get(`/api/aariba/${file.name}`)
                            .map(res => res.json() as any)
                            .subscribe(script => {
                                let content = this.editor.getSession().getValue();
                                let opened_file = this.file_manager.open(file, script.content, content);
                                this.setFile(opened_file);
                            });
                    }
                }, error => {
                    console.log(error);
                });
        }
    }

    edit(event: Event, next_file: FileTab) {
        event.preventDefault();

        this.cleanPreviousFile();

        let content = this.editor.getSession().getValue();
        this.file_manager.edit(next_file, content);
        this.setFile(next_file);

        if (next_file.readonly) {
            this.obtainLiveContentUpdate(next_file);
        }
    }

    commit(): void {
        let current_file = this.currentFile();
        if (current_file && !current_file.readonly) {
            current_file.content = this.editor.getSession().getValue();
            this.commit_modal.show(this.currentFile());
        }
    }

    currentFile(): FileTab {
        if (this.file_manager.hasAnyFile()) {
            return this.file_manager.currentFile();
        }
        return null;
    }

    currentFileIsReadOnly(): boolean {
        let current_file = this.currentFile();
        if (current_file) {
            return current_file.readonly;
        }
        return true;
    }

    createNewFile(): void {
        let previous_content = this.editor.getSession().getValue();
        let new_file = this.file_manager.createNewFile(previous_content);
        this.setFile(new_file);
    }

    fileList(): Array<FileTab> {
        return this.file_manager.fileList();
    }

    ngAfterViewInit(): void {
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
    }

    private setFile(file: FileTab): void {
        this.editor.getSession().setValue(file.content);
        this.editor.setReadOnly(file.readonly);
        this.listenToChange(null, this.editor);
    }

    private listenToChange(action: any, editor: any): void {
        try {
            let file = this.currentFile();
            let new_content = editor.getValue();
            if (!file.readonly) {
                this.io.post<string>(
                    `/api/aariba/${file.name}/liveupdate`,
                    new_content
                );
            }
            this.editor.getSession().clearAnnotations();
            this.interpreter.reset();
            this.interpreter.execute(new_content);
        } catch (e) {
            let error: AaribaScriptError = e;
            if (error.location) {
              this.editor.getSession().setAnnotations([
                  {
                      row: error.location.start.line - 1,
                      column: error.location.start.column - 1,
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
