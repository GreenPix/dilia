import {Component, ViewChild} from '@angular/core';
import {AfterViewInit, OnDestroy} from '@angular/core';
import {WebGLSurface} from '../webgl/surface';
import {ChipsetModal} from './chipset-upload';
import {ChipsetService} from './chipset.service';
import {CommitModal} from '../commit';
import {CreateNewMapModal, NewMap} from './createnewmap';
import {MapManager} from '../../models/map';
import {EditorState} from './editor-state';
import {Brush} from './editor-state/brush';
import {PaletteArea} from './editor-state/palette-area';
import {EditorArea} from './editor-state/editor-area';
import {MapSettings} from './map-settings';
import {LayersPanel} from './layers-panel';
import {PanelState} from './panel-state';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');

@Component({
    selector: 'map-editor',
    viewProviders: [PanelState],
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate,
    directives: [
        WebGLSurface, ChipsetModal, MapSettings,
        LayersPanel, CreateNewMapModal, CommitModal,
    ],
    providers: [
        ChipsetService, EditorState, Brush,
        EditorArea, PaletteArea
    ]
})
export class MapEditor implements AfterViewInit, OnDestroy {

    @ViewChild(WebGLSurface)
    private surface: WebGLSurface;
    @ViewChild(ChipsetModal)
    private chipset_modal: ChipsetModal;
    @ViewChild(CreateNewMapModal)
    private create_map_modal: CreateNewMapModal;
    @ViewChild(CommitModal)
    private commit_modal: CommitModal;

    constructor(
        private state: EditorState,
        private map_manager: MapManager,
        private chipset_service: ChipsetService
    ) {}

    currentMapIsReadOnly() {
        return this.map_manager.currentMap() === undefined;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    openMap(map: any) {
        this.map_manager.openMap(map);
    }

    ngOnDestroy(): void {
        this.state.cleanUp();
    }

    createNewMap(): void {
        this.create_map_modal.clear();
        this.create_map_modal.show();
    }

    commit(): void {
        if (this.map_manager.currentMap()) {
            this.commit_modal.show(this.map_manager.currentMap());
        }
    }

    /// This is a hook to be used only by
    /// the template when a layer is being selected
    onSelectLayer(id: number): void {
        this.state.onSelectLayer(id);
    }

    /// This is a hook to be used only by
    /// the template when a map is being created
    onNewMap(new_map: NewMap): void {
        this.map_manager.createMap(
            new_map.name,
            new_map.width,
            new_map.height);
        this.state.edit(this.map_manager.currentMap());
    }

    ngAfterViewInit(): void {
        this.state.init(this.surface);
        let map = this.map_manager.currentMap();
        if (map) {
            this.state.edit(this.map_manager.currentMap());
        }
    }
}
