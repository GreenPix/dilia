import {Injectable} from '@angular/core';

export enum Panel {
    Layers,
    Options,
    None
}

@Injectable()
export class PanelState {

    private active_panel: string;

    activePanelStr(): string {
        return this.active_panel;
    }

    activePanel(): Panel {
        if (this.active_panel === 'layers') {
            return Panel.Layers;
        } else if (this.active_panel === 'options') {
            return Panel.Options;
        } else {
            return Panel.None;
        }
    }

    activatePanel(panel: string) {
        if (panel === 'layers') {
            this.active_panel = panel;
        } else if (panel === 'options') {
            this.active_panel = panel;
        } else {
            this.active_panel = '';
        }
    }
}
