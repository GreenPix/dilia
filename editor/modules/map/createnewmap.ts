import {ViewChild, Component} from '@angular/core';
import {Output, EventEmitter} from '@angular/core';
import {Dialog} from '../../components';
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
})
export class CreateNewMapModal {

    @ViewChild('newmapdialog')
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
