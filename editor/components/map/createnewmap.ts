import {Component} from '@angular/core';
import {Output, EventEmitter} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {NgModel} from '@angular/common';
import {ViewChild} from '@angular/core';
import {Dialog} from '../modal/dialog';
import {MapManager} from '../../models/map';

let templateUrl = require<string>('./createnewmap.html');

export interface NewMap {
    name: string;
    width: number;
    height: number;
}

@Component({
    selector: 'create-map-modal',
    templateUrl: templateUrl,
    directives: [Dialog, CORE_DIRECTIVES, NgModel]
})
export class CreateNewMapModal {

    @ViewChild(Dialog)
    private dialog: Dialog;

    @Output('newMap')
    private emitter = new EventEmitter<NewMap>();

    private new_map: NewMap = { name: '' } as any;

    constructor(
        private map_manager: MapManager
    ) {}

    clear() {
        this.new_map = { name: '' } as any;
    }

    show() {
        this.dialog.show();
    }

    hide(event?: Event) {
        this.dialog.hide(event);
    }

    create() {
        this.emitter.emit(this.new_map);
        this.hide();
    }
}
