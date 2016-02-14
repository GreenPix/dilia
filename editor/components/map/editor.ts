import {Component, View, ViewChild} from 'angular2/core';
import {AfterViewInit, OnDestroy} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';
import {ChipsetModal} from './chipset';
import {MapManager} from '../../models/map';
import {EditorState} from './editor-state';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');

@Component({
    selector: 'map-editor',
})
@View({
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate,
    directives: [WebGLSurface, ChipsetModal]
})
export class MapEditor implements AfterViewInit, OnDestroy {

    @ViewChild(WebGLSurface)
    private surface: WebGLSurface;

    @ViewChild(ChipsetModal)
    private chipset_modal: ChipsetModal;
    private state: EditorState = new EditorState();

    constructor(
        private map_manager: MapManager
    ) {}

    currentMapIsReadOnly() {
        return false;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    openMap(map: any) {
        this.map_manager.openMap(map);
    }

    selectLayer(index: number) {
        this.map_manager.selectLayer(index);
    }

    ngOnDestroy(): void {
        this.state.cleanUp();
    }

    ngAfterViewInit(): void {
        this.state.init(this.surface);
    }
}
