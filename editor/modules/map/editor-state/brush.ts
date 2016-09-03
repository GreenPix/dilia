import {Injectable} from '@angular/core';
import {WebGLSurface} from '../../../components';
import {SpriteHandle} from '../../../rendering/sprite';
import {Map, ChipsetLayer} from '../../../models/map';
import {TilesHandle} from '../../../rendering/tiles';
import {Command} from '../../../rendering/interfaces';
import {SpriteRenderEl} from '../../../rendering/draw';
import {Context} from '../../../rendering/context';
import {Texture} from '../../../gl/gl';


@Injectable()
export class Brush implements Command {

    width: number = 1;
    tiles_ids: Uint16Array = new Uint16Array([93]);
    sprite_renderer: SpriteRenderEl;
    sprite: SpriteHandle;

    // To track where and when to apply the changes
    private active_layer: number = 0;
    private active_chipset: number = 0;

    // This will be set once the within the palette area
    // an element has been chosen.
    private chipset_path: string;
    private chipset_tex: Texture;
    private has_changed: boolean = false;

    // Handle to the map model
    private map: Map;
    // and handle to the visual rendering
    // of the map.
    private map_handle: TilesHandle;

    private surface: WebGLSurface;

    setMap(map: Map) {
        this.map = map;
    }

    setSurface(surface: WebGLSurface) {
        this.surface = surface;
    }

    execute(ctx: Context) {
        if (this.sprite_renderer) {
            this.sprite_renderer.execute(ctx);
        }
    }

    setMapHandle(map_handle: any) {
        this.map_handle = map_handle;
    }

    position(x: number, y: number): void {
        if (this.sprite) {
            x = Math.floor(x / 16) * 16;
            y = Math.floor(y / 16) * 16;

            let w = this.width;
            let h = this.tiles_ids.length / w;
            this.sprite.position([
                x - Math.floor(w / 2) ,
                y + Math.floor(h / 2)
            ]);
        }
    }

    paint(x: number, y: number) {
        if (!this.sprite_renderer) return;
        // This modify the same array on both the model
        // and the visualization.
        //
        // If we want to support undo / redo we need to
        // do something about it here.

        let active_layer = this.map.currentLayer();

        if (active_layer < 0) return;

        if (this.active_layer !== active_layer) {
            this.has_changed = true;
            this.active_layer = active_layer;
        }

        // Insert a new "partial" layer or "chipset" layer
        // if needed.
        this.insertNewLayerIfNeeded(active_layer);

        // Then we can select the rendered layer
        let selected_layer = this.map_handle.select(
            active_layer, this.active_chipset
        );
        let selected_model_layer = this.map.select(
            active_layer, this.active_chipset
        );
        let w = this.width;
        let h = this.tiles_ids.length / w;


        for (let i = 0; i < this.tiles_ids.length; ++i) {
            let dx = (i % w) - Math.floor(w / 2);
            let dy = Math.floor(i / w) + Math.floor(h / 2);
            let tile_id = this.tiles_ids[i];
            selected_layer.setTileId(x + dx, y + dy, tile_id);
            selected_model_layer.setTileId(x + dx, y + dy, tile_id);
        }
        selected_layer.finalize();
    }

    replaceWith(width: number, tile_id: number, chipset_tex: Texture, chipset_path: string) {

        if (this.chipset_path !== chipset_path) {
            this.has_changed = true;
        }

        this.chipset_tex = chipset_tex;
        this.chipset_path = chipset_path;

        this.tiles_ids[0] = tile_id;

        this.createSpriteRenderEl(chipset_tex, tile_id);
    }

    private createSpriteRenderEl(chipset_tex: Texture, tile_id: number) {
        this.sprite_renderer = this.surface.createSpriteRenderEl();
        this.sprite_renderer.loadSpriteObject(chipset_tex, builder => {
            this.sprite = builder
                .overlayFlag(true)
                .buildFromTileId(16, tile_id);
        });
    }

    private insertNewLayerIfNeeded(active_layer: number) {
        if (this.has_changed) {
            this.has_changed = false;
            let model_layer = this.map.layers[active_layer];

            let c: ChipsetLayer;
            let index = model_layer.raw.findIndex(c => c.chipset === this.chipset_path);
            if (index >= 0) {
                c = model_layer.raw[index];
                this.active_chipset = index;
            } else {
                c = {
                    chipset: this.chipset_path,
                    tiles_id: new Uint16Array(this.map.width * this.map.height),
                };
                model_layer.raw.push(c);
                this.map_handle.insertChipset(active_layer, this.chipset_tex);
                this.active_chipset = model_layer.raw.length - 1;
            }
        }
    }
}
