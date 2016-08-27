import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';

import {MapManager} from '../models/map';

import {Brush} from './map/editor-state/brush';
import {PaletteArea} from './map/editor-state/palette-area';
import {EditorArea} from './map/editor-state/editor-area';
import {EditorState} from './map/editor-state';

import {ChipsetModal} from './map/chipset-upload';
import {ChipsetService} from './map/chipset.service';
import {CreateNewMapModal} from './map/createnewmap';
import {MapEditor} from './map/editor';
import {LayersPanel} from './map/layers-panel';
import {MapSettings} from './map/map-settings';
import {PanelState} from './map/panel-state';

@NgModule({
    imports: [SharedModule],
    declarations: [
        MapEditor,
        LayersPanel,
        MapSettings,
        ChipsetModal,
        CreateNewMapModal,
    ],
    providers: [
        MapManager,
        // Brush,
        // ChipsetService,
        // EditorArea,
        // PaletteArea,
        EditorState,
        PanelState,
    ],
    exports: [
        MapEditor,
    ],
})
export class MapModule {}
