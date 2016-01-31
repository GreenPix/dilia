import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {ViewChild} from 'angular2/core';
import {Dialog} from '../modal/dialog';

@Component({
    selector: 'chipset-modal'
})
@View({
    styles: [
        `
        .btn-file {
            position: relative;
            overflow: hidden;
        }
        .btn-file input[type=file] {
            position: absolute;
            top: 0;
            right: 0;
            min-width: 100%;
            min-height: 100%;
            font-size: 100px;
            text-align: right;
            filter: alpha(opacity=0);
            opacity: 0;
            outline: none;
            background: white;
            cursor: inherit;
            display: block;
        }
        `
    ],
    template: `
        <dialog-modal>
            <dialog-header>Edit a chipset</dialog-header>
            <dialog-body>
                <span class="btn btn-default btn-file">
                    Browse <input type="file">
                </span>
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
