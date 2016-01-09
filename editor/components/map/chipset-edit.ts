import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ViewChild} from 'angular2/core';
import {Dialog} from '../modal/dialog';

@Component({
    selector: 'chipset-editor'
})
@View({
    template: `
        <dialog-modal>
            <dialog-header>Edit a chipset</dialog-header>
            <dialog-body>
                <ol>
                    <li>Image uploader</li>
                    <li>(next) Object/Tiles resize area</li>
                    <li>Object/Tiles list area</li>
                </ol>
            </dialog-body>
            <dialog-footer>
                <button type="button" class="btn btn-default"
                    (click)="hide($event)">Cancel</button>
                <button type="button" class="btn btn-primary"
                    (click)="next()">Next</button>
            </dialog-footer>
        </dialog-modal>
    `,
    directives: [Dialog, CORE_DIRECTIVES]
})
export class ChipsetEditor {

    @ViewChild(Dialog)
    private dialog: Dialog;

    constructor() {}

    hide(event?: Event) {
        this.dialog.hide(event);
    }

    next() {
        console.log('next');
    }
}
