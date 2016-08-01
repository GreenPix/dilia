import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {PanelState} from './panel-state';

let mapSettingsScss = require<Webpack.Scss>('./map-settings.scss');

@Component({
    selector: 'map-editor-settings',
    styles: [mapSettingsScss.toString()],
    directives: [CORE_DIRECTIVES],
    template: `
    <div style="display: flex;">
        <div class="map-settings--button selected"
            [ngClass] = "{ 'selected': state.activePanelStr() == 'layers' }"
            (click)="activatePanel('layers')">
            <span class="fa fa-cubes"></span>Layers
        </div>
        <div class="map-settings--button"
            [ngClass] = "{ 'selected': state.activePanelStr() == 'options' }"
            (click)="activatePanel('options')">
            <span class="fa fa-gear"></span>Options
        </div>
    </div>
    `
})
export class MapSettings {

    constructor(private state: PanelState) {}

    activatePanel(panel: string) {
        this.state.activatePanel(panel);
    }
}
