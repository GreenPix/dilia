import {DefaultFBO} from '../../../rendering/fbo';
import {genPixelsForTextureWithBorder} from '../../../rendering/util';
import {SpriteBuilder} from '../../../rendering/sprite';
import {TilesHandle} from '../../../rendering/tiles';
import {SpriteProgram, TileProgram} from '../../../rendering/shaders';
import {CommandBuffer, ClearAll, FlipY} from '../../../rendering/pipeline';
import {Map} from '../../../models/map';
import {Brush} from './brush';
import {State} from './index';
import {Area} from './area';

class GridHandle {
    constructor(
        private grid: SpriteBuilder,
        private map: Map
    ) {}

    updateGrid(new_zoom_level: number) {
        this.grid.updateTexture(
            genPixelsForTextureWithBorder(this.map.tile_size * new_zoom_level)
        )
        .buildWithSize(
            this.map.widthInPx(),
            this.map.heightInPx(),
            true,
            new_zoom_level
        );
    }
}

export class EditorArea extends Area {

    private map_handle: TilesHandle;
    private grid: GridHandle;
    private is_mouse_pressed: boolean = false;

    constructor(private brush: Brush) {
        super();
    }

    cleanUp() {
        super.cleanUp();
        this.map_handle = undefined;
    }

    activate() {}
    deactivate() {
        this.zbehavior.desactivate();
        this.is_mouse_pressed = false;
    }

    load(map: Map) {
        // Load the map. We compute first the position of the chipset that
        // are going to be loaded from the server.
        let chipsets_pos: {[path: string]: number} = {};
        let chipsets_path: string[] = [];
        for (let l of map.layers) {
            for (let pl of l.raw) {
                if (!(pl.chipset in chipsets_pos)) {
                    chipsets_pos[pl.chipset] = chipsets_path.length;
                    chipsets_path.push(pl.chipset);
                }
            }
        }

        let map_tiled = this.surface.createTilesRenderEl();
        map_tiled.loadTileLayerObject(chipsets_path, (chipsets, builder) => {
            let handle = builder.setWidth(map.width)
                .setHeight(map.height)
                .tileSize(map.tile_size);
            for (let i = 0; i < map.layers.length; ++i) {
                let layer = map.layers[i].raw.map(pl => {
                    return {
                        tiles_id: pl.tiles_id,
                        chipset: chipsets[chipsets_pos[pl.chipset]]
                    };
                });
                handle.addLayer(layer);
            }
            this.map_handle = handle.build();
            this.camera.centerOn(this.map_handle);
        });

        let brush = this.surface.createSpriteRenderEl();
        brush.loadSpriteObject(map.layers[0].raw[0].chipset, builder => {
            this.brush.sprite = builder
                .overlayFlag(true)
                .buildFromTileId(16, this.brush.tiles_ids[0]);
        });

        // let full_map_fbo = new FBO(this.surface.getGLContext());
        // full_map_fbo.setSize(map.widthInPx(), map.heightInPx());

        // let map_quad = surface.createSpriteRenderEl();
        // map_quad.loadSpriteObject(full_map_fbo.getTexture(),
        //     builder => builder.buildWithEntireTexture()
        // );

        let zoom = this.camera.zoom_lvl;
        let grid = this.surface.createSpriteRenderEl();
        grid.loadSpriteObject(
            genPixelsForTextureWithBorder(map.tile_size * zoom),
            builder => {
                this.grid = new GridHandle(
                    builder,
                    map
                );
                this.grid.updateGrid(zoom);
        });

        this.scene = new CommandBuffer([
            DefaultFBO,
            ClearAll,
            SpriteProgram,
            this.camera,
            grid,
            TileProgram,
            map_tiled,
            FlipY,
            SpriteProgram,
            brush
        ]);

    }

    //////////////////////////////////////////////
    ///             Editor State               ///
    //////////////////////////////////////////////

    mouseUpEditor(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseUp(event.button, x, y);
        this.is_mouse_pressed = false;
        return State.Editor;
    }

    mouseDownEditor(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseDown(event.button, x, y);
        if (event.button === 0) {
            // TODO: Instead of always picking the same
            // layer, we should select the appropriate one
            let selected_layer = this.map_handle.select(this.active_layer, 0);
            this.brush.paint(selected_layer, x, y);
            this.is_mouse_pressed = true;
        }
        return State.Editor;
    }

    mouseMoveEditor(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseMove(event, x, y);

        if (this.is_mouse_pressed && this.map_handle) {
            // TODO: Should only be applied every
            // x that are distant from at least width
            // (same for y) to avoid erasing the
            // previous brush
            let selected_layer = this.map_handle.select(this.active_layer, 0);
            this.brush.paint(selected_layer, x, y);
        }

        this.brush.position(x, y);
        return State.Editor;
    }

    mouseWheelEditor(event: WheelEvent): State {
        this.zbehavior.mouseWheel(event);
        this.grid.updateGrid(this.camera.zoom_lvl);
        return State.Editor;
    }

    private objectSpace(event: MouseEvent): [number, number] {
        return this.camera.fromWindowCoordToObjectSpace(
            event.clientX, event.clientY - 63
        );
    }
}
