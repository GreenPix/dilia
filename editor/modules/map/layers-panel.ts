import {Output, EventEmitter, SimpleChanges} from '@angular/core';
import {OnChanges, AfterViewInit, OnDestroy} from '@angular/core';
import {QueryList, ViewChildren} from '@angular/core';
import {Component, Input} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {EditorArea} from './editor-state/editor-area';
import {PanelState, Panel} from './panel-state';
import {Map, Layer} from '../../models/map';
import {WebGLSingleTextureSurface} from '../../components/webgl/simple-surface';


let layerPanelCss = require<Webpack.Scss>('./layers-panel.scss');
let layerPanelTemplate = require<string>('./layers-panel.html');

@Component({
    selector: 'layer-panel',
    styles: [layerPanelCss.toString()],
    templateUrl: layerPanelTemplate,
})
export class LayersPanel implements OnChanges, AfterViewInit, OnDestroy {

    private is_visible: boolean = false;
    private is_shown: boolean = false;
    private selected_layer: number = 0;
    private pixels_sub: Subscription;

    @Input('currentMap') current_map: Map;
    @Output('selectLayer') select_layer = new EventEmitter<number>();
    @ViewChildren(WebGLSingleTextureSurface) layers: QueryList<WebGLSingleTextureSurface>;

    constructor(
        private state: PanelState,
        private area: EditorArea
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        if (this.current_map) {
            this.selected_layer = this.current_map.currentLayer();
            if (changes['current_map']) {
                this.current_map.layers
                    .forEach((_, i) => this.area.layer_index_stream.next(i));
            }
        }
    }

    ngAfterViewInit() {
        this.pixels_sub = this.area.pixels_stream.subscribe(([pixels, index]) => {
            this.layers.toArray()[index].loadTexture(pixels);
        });
    }

    ngOnDestroy() {
        this.pixels_sub.unsubscribe();
    }

    isShown(): boolean {
        let is_shown = this.state.activePanel() === Panel.Layers;
        if (this.is_shown !== is_shown && !is_shown) {
            setTimeout(() => {
                this.is_visible = false;
            }, 500);
        }
        else if (this.is_shown !== is_shown && is_shown) {
            this.is_visible = true;
        }
        this.is_shown = is_shown;
        return is_shown;
    }

    layerList(): any[] {
        return this.current_map.layers;
    }

    isMapValid(): boolean {
        return this.current_map !== undefined;
    }

    selectLayer(layer: Layer, event: Event) {
        event.preventDefault();
        let index = layer.select();
        if (index >= 0) {
            this.selected_layer = index;
            this.select_layer.emit(index);
            this.area.layer_index_stream.next(index);
        }
    }

    hide() {
        this.state.activatePanel('');
    }
}
