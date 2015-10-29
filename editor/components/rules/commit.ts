import {Component, View} from 'angular2/angular2';
import {Dialog} from '../modal/dialog';

@Component({
    selector: 'commit-modal',
    host: {
        '(click)': 'show',
    }
})
@View({
    template: `
        <dialog>
            <dialog-header>Commit a revision for {{filename}}</dialog-header>
        </dialog>
    `,
    directives: [Dialog]
})
export class CommitModal {

    filename: string;

    show(filename: string) {
        this.filename = filename;
    }
}
