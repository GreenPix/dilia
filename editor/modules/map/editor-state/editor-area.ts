import {Injectable} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';
import {DefaultFBO, FBO} from '../../../rendering/fbo';
import {genPixelsForTextureWithBorder} from '../../../rendering/util';
import {SpriteBuilder} from '../../../rendering/sprite';
import {ReadPixel} from '../../../rendering/readpixel';
import {Pixels} from '../../../gl/gl';
import {SimpleCamera} from '../../../rendering/camera';
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

@Injectable()
export class EditorArea extends Area {

    private map_handle: TilesHandle;
    private grid: GridHandle;
    private map: Map;
    private is_mouse_pressed: boolean = false;
    private scene_with_fbo: CommandBuffer;

    pixels_stream = new Subject<[Pixels, number]>();
    layer_index_stream = new Subject<number>();

    private buffer: number[] = [];
    private readpixel_sub: Subscription;
    private layerindex_sub: Subscription;

    constructor(private brush: Brush) {
        super();
    }

    cleanUp() {
        super.cleanUp();
        this.map_handle = undefined;
        this.unsubscribe();
    }

    activate() {}
    deactivate() {
        this.zbehavior.desactivate();
        this.is_mouse_pressed = false;
    }

    load(map: Map) {
        this.map = map;
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
            this.brush.setMapHandle(this.map_handle);
            this.camera.centerOn(this.map_handle);
        });

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
            new SpriteProgram(),
            this.camera,
            grid,
            new TileProgram(),
            this.camera,
            map_tiled,
            FlipY,
            new SpriteProgram(),
            this.camera,
            this.brush
        ]);

        // The pipeline that does the rendering of a layer:
        let fbo = new FBO(this.surface.getGLContext());
        const width = 256;
        const height = 256;
        fbo.setSize(width, height);

        this.unsubscribe();

        this.layer_index_stream.subscribe(index => {
            this.buffer.push(index);
            this.surface.setCommandBuffer(this.scene_with_fbo);
        });

        let readpixel = new ReadPixel(width, height);
        this.readpixel_sub = readpixel.stream.subscribe(pixels => {
            let pix = new Pixels();
            pix.raw = new Uint32Array(pixels.buffer);
            pix.width = width;
            this.pixels_stream.next([pix, this.buffer.shift()]);
        });
        let simple_camera = new SimpleCamera(
            width,
            height,
            map.widthInPx(),
            map.heightInPx()
        );
        // We want part of this things
        // to be controlled by an observable that
        // is watching for changes in active layer
        // as well as direct request (the first time)
        // for both layer.
        // It basically listen to a stream of layer index
        // and listen for them processing them using
        // switch with this command buffer.
        this.scene_with_fbo = new CommandBuffer([
            fbo,
            ClearAll,
            new SpriteProgram(),
            simple_camera,
            grid,
            new TileProgram(),
            // We render a single layer,
            // the active layer. Actually it would be better
            // to render the layer that is concerned by
            // the change.
            simple_camera,
            map_tiled.createSingleLayerRenderer(this),
            readpixel,
            // CommandBuffer is now a Command as well
            // (make the code simpler)
            this.scene,
            // "Fake" command, only used to switch back
            // to the main scene.
            () => {
                if (this.buffer.length === 0) {
                    this.surface.setCommandBuffer(this.scene);
                }
            },
        ]);
    }

    currentLayer(): number {
        return this.buffer[0];
    }

    private unsubscribe() {
        if (this.readpixel_sub) {
            this.readpixel_sub.unsubscribe();
            this.readpixel_sub = undefined;
        }
        if (this.layerindex_sub) {
            this.layerindex_sub.unsubscribe();
            this.layerindex_sub = undefined;
        }
    }

    //////////////////////////////////////////////
    ///             Editor State               ///
    //////////////////////////////////////////////

    mouseUpEditor(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseUp(event.button, x, y);
        if (this.map && this.is_mouse_pressed) {
            this.layer_index_stream.next(this.map.currentLayer());
        }
        this.is_mouse_pressed = false;
        return State.Editor;
    }

    mouseDownEditor(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseDown(event.button, x, y);
        if (event.button === 0) {
            this.brush.paint(x, y);
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
            this.brush.paint(x, y);
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
