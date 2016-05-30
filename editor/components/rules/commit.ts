import {Component, ViewChild} from '@angular/core';
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from '@angular/common';
import {Dialog} from '../modal/dialog';
import {FileTab, FileManager} from '../../models/scripting';

@Component({
    selector: 'commit-modal',
    template: `
        <dialog-modal>
            <dialog-header>Commit your changes for <code>{{filename}}</code></dialog-header>
            <dialog-body>
                <div class="form-group" *ngIf="file?.isNew">
                    <label class="control-label">File name:</label>
                    <input [(ngModel)]="filename" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label for="commit-content" class="control-label">Message:</label>
                    <input [(ngModel)]="message"
                        type="text" class="form-control"
                        id="commit-content"
                        [attr.placeholder]="file?.isNew ? 'First commit': 'Updated ' + filename + '.'">
                </div>
            </dialog-body>
            <dialog-footer>
                <button type="button" class="btn btn-default" (click)="hide($event)">Cancel</button>
                <button type="button" class="btn btn-primary"
                    [ngClass]="{ 'disabled': committing }"
                    (click)="commit()">Save changes</button>
            </dialog-footer>
        </dialog-modal>
    `,
    directives: [Dialog, FORM_DIRECTIVES, CORE_DIRECTIVES]
})
export class CommitModal {

    private file: FileTab;
    private message: string;
    private filename: string;
    private committing: boolean;

    @ViewChild(Dialog)
    private dialog: Dialog;

    constructor(private filemanager: FileManager) {
        this.committing = false;
    }

    show(file: FileTab) {
        this.file = file;
        this.filename = this.file.name;
        this.committing = false;
        this.message = '';
        this.dialog.show();
    }

    hide(event?: Event) {
        this.dialog.hide(event);
    }

    commit() {
        if (this.message.length > 8 && this.filename.length > 3 && !this.committing) {
            this.committing = true;
            this.file.name = this.filename;
            this.filemanager.commit(this.file, this.message)
                .subscribe(res => {
                    this.committing = false;
                    this.hide();
                });
        } else {
            console.log(`error ${this.message}, ${this.filename}`);
        }
    }
}
