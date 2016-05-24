import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ViewChild} from 'angular2/core';
import {Dialog} from '../modal/dialog';
import {Upload} from '../upload/upload';

@Component({
    selector: 'chipset-modal',
    template: `
        <dialog-modal>
            <dialog-header>Edit a chipset</dialog-header>
            <dialog-body>
                <upload></upload>
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
    directives: [Dialog, CORE_DIRECTIVES, Upload]
})
export class ChipsetModal {

    @ViewChild(Dialog)
    private dialog: Dialog;

    constructor() {}

    show() {
        this.dialog.show();
    }

    hide(event?: Event) {
        this.dialog.hide(event);
    }

    next() {
        console.log('next');
    }
}
