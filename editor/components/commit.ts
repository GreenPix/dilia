import {Component, ViewChild, Input} from '@angular/core';
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from '@angular/common';
import {Dialog} from './modal/dialog';
import {CommitObject, Committer} from '../models/commitable';

@Component({
    selector: 'commit-modal',
    template: `
        <dialog-modal>
            <dialog-header>Commit your changes for <code>{{object_name}}</code></dialog-header>
            <dialog-body>
                <div class="alert alert-danger" *ngIf="error_message !== ''">
                    <span class="control-label">{{error_message}}</span>
                </div>
                <div class="form-group" *ngIf="object?.is_new">
                    <label class="control-label">{{title}}</label>
                    <input [(ngModel)]="object_name" type="text" class="form-control">
                </div>
                <div class="form-group">
                    <label for="commit-content" class="control-label">Message</label>
                    <input [(ngModel)]="message"
                        type="text" class="form-control"
                        id="commit-content"
                        [attr.placeholder]="object?.is_new ? 'First commit': 'Updated ' + object_name + '.'">
                </div>
            </dialog-body>
            <dialog-footer>
                <button type="button" class="btn btn-default" (click)="hide($event)">Cancel</button>
                <button type="button" class="btn btn-primary"
                    [disabled]="!canCommit()"
                    (click)="commit()">Save changes</button>
            </dialog-footer>
        </dialog-modal>
    `,
    directives: [Dialog, FORM_DIRECTIVES, CORE_DIRECTIVES]
})
export class CommitModal {

    @Input() title: string = 'Object name:';
    @Input() service: Committer;

    private object: CommitObject;
    private message: string = '';
    private object_name: string = '';
    private committing: boolean = false;

    private error_message: string = '';

    @ViewChild(Dialog)
    private dialog: Dialog;

    canCommit(): boolean {
        return this.message.length > 8 &&
            this.object_name.length > 3 &&
            !this.committing;
    }

    show(object: CommitObject) {
        this.object = object;
        this.object_name = this.object.name;
        this.committing = false;
        this.message = '';
        this.dialog.show();
    }

    hide(event?: Event) {
        this.dialog.hide(event);
    }

    commit() {
        if (this.canCommit()) {
            this.committing = true;
            this.object.name = this.object_name;
            this.service.commit(this.object, this.message)
                .subscribe(res => {
                    this.committing = false;
                    this.hide();
                }, err => {
                    this.committing = false;
                    this.error_message = `Couldn't commit, cause: '${err}'`;
                    console.log(err);
                });
        }
    }
}
