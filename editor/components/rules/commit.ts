import {Component, View, ViewChild} from 'angular2/angular2';
import {Dialog} from '../modal/dialog';

@Component({
    selector: 'commit-modal',
})
@View({
    template: `
        <dialog-modal>
            <dialog-header>Commit a revision for <code>{{filename}}</code></dialog-header>
            <dialog-body>
                <div class="form-group">
                    <label for="commit-content" class="control-label">Message:</label>
                    <input type="text" class="form-control" id="commit-content">
                </div>
            </dialog-body>
            <dialog-footer>
                <button type="button" class="btn btn-default" (click)="hide($event)">Cancel</button>
                <button type="button" class="btn btn-primary" (click)="commit()">Save changes</button>
            </dialog-footer>
        </dialog-modal>
    `,
    directives: [Dialog]
})
export class CommitModal {

    private filename: string;

    @ViewChild(Dialog)
    private dialog: Dialog;

    show(filename: string) {
        this.filename = filename;
        this.dialog.show();
    }

    hide(event: Event) {
        this.dialog.hide(event);
    }

    commit() {
        console.log('Committed file !');
    }
}
