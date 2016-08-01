import {Output, EventEmitter} from '@angular/core';
import {Component, Input} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {PanelState, Panel} from './panel-state';
import {Map, Layer} from '../../models/map';


let layerPanelCss = require<Webpack.Scss>('./layers-panel.scss');
let layerPanelTemplate = require<string>('./layers-panel.html');

@Component({
    selector: 'layer-panel',
    styles: [layerPanelCss.toString()],
    templateUrl: layerPanelTemplate,
    directives: [CORE_DIRECTIVES]
})
export class LayersPanel {

    private is_visible: boolean = false;
    private is_shown: boolean = false;

    @Input('currentMap') current_map: Map;
    @Output('selectLayer') select_layer = new EventEmitter<number>();

    constructor(
        private state: PanelState
    ) {}

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
            this.select_layer.emit(index);
        }
    }

    hide() {
        this.state.activatePanel('');
    }
}
