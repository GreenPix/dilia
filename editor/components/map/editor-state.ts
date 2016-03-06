import {WebGLSurface} from '../webgl/surface';
import {MouseHandler, KeyHandler} from '../webgl/surface';
import {Camera} from '../../rendering/camera';
import {Map} from '../../models/map';
import {ZoomBehavior} from '../webgl/zoom';
import {SceneManager} from '../../rendering/scene';
import {TilesHandle, SelectedPartialLayer} from '../../rendering/tiles';
import {SpriteHandle} from '../../rendering/sprite';

let vertex_shader_overlay_src = require<string>('./shaders/dark_overlay.vs');
let fragment_shader_overlay_src = require<string>('./shaders/dark_overlay.fs');

class Brush {

    width: number = 1;
    tiles_ids: Uint16Array = new Uint16Array([93]);
    sprite: SpriteHandle;

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

    paint(selected_layer: SelectedPartialLayer, x: number, y: number) {
        let w = this.width;
        let h = this.tiles_ids.length / w;
        for (let i = 0; i < this.tiles_ids.length; ++i) {
            let dx = (i % w) - Math.floor(w / 2);
            let dy = Math.floor(i / w) + Math.floor(h / 2);
            let tile_id = this.tiles_ids[i];
            selected_layer.setTileId(x + dx, y + dy, tile_id);
        }
    }

    replaceWith(width: number, tile_id: number) {
        this.tiles_ids[0] = tile_id;
        // Ugly hack fix this and have a proper function.
        (this.sprite as any).buildFromTileId(16, tile_id);
    }
}

class DynamicMap {
    handles: TilesHandle[] = [];
}

enum State {
    Palette,
    Editor
}

export class EditorState implements MouseHandler, KeyHandler {

    private camera_editor: Camera = new Camera();
    private camera_palette: Camera = new Camera();

    private zbehavior_editor: ZoomBehavior;
    private zbehavior_palette: ZoomBehavior;

    private map_handle: TilesHandle;
    private active_layer: number = 0;
    private brush: Brush = new Brush();
    private brush_area: SpriteHandle;
    private chipset_palette: SpriteHandle;

    private scene_editor: SceneManager;
    private scene_palette: SceneManager;
    private state: State = State.Editor;
    private is_mouse_pressed: boolean = false;

    private surface: WebGLSurface;

    constructor() {
        this.zbehavior_editor = new ZoomBehavior(this.camera_editor);
        this.zbehavior_palette = new ZoomBehavior(this.camera_palette);
    }

    init(surface: WebGLSurface, map: Map) {

        let p0 = surface.createGenericRenderingContext()
            .setShader(vertex_shader_overlay_src, fragment_shader_overlay_src)
            .addVertexBuffer('position', [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1], 2);

        let p1 = surface.createSpriteRenderingContext()
            .addSpriteObject(map.layers[0].raw[0].chipset, builder => {
                this.chipset_palette = builder.buildWithEntireTexture();
                this.camera_palette.centerOn(this.chipset_palette);
            })
            .addSpriteObject([51, 122, 183, 178], builder => {
                this.brush_area = builder.buildWithSize(16, 16);
            });

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

        let c1 = surface.createTilesRenderingContext()
            .addTileLayerObject(chipsets_path, (chipsets, builder) => {
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
                this.camera_editor.centerOn(this.map_handle);
            });

        let c2 = surface.createSpriteRenderingContext()
            .addSpriteObject(map.layers[0].raw[0].chipset, builder => {
                this.brush.sprite = builder
                    .overlayFlag(true)
                    .buildFromTileId(16, this.brush.tiles_ids[0]);

                surface.setMouseHandler(this);
            });

        this.scene_editor = new SceneManager([
            this.camera_editor,
            c1,
            c2
        ]);

        this.scene_palette = new SceneManager([
            this.camera_editor,
            c1,
            this.camera_palette,
            p0,
            p1
        ]);

        surface.setSceneManager(this.scene_editor);
        surface.setKeyHandler(this);
        this.surface = surface;
    }

    cleanUp() {
        this.surface.setSceneManager(undefined);
        this.surface.setMouseHandler(undefined);
        this.map_handle = undefined;
        this.brush.sprite = undefined;
        this.surface = undefined;
    }

    //////////////////////////////////////////////
    ///            State changes               ///
    //////////////////////////////////////////////

    private switchToState(state: State) {
        this.state = state;
        if (this.surface && this.scene_editor && this.scene_palette) {
            if (this.state == State.Palette) {
                this.zbehavior_editor.desactivate();
                this.surface.setSceneManager(this.scene_palette);
            } else {
                this.zbehavior_palette.desactivate();
                this.surface.setSceneManager(this.scene_editor);
            }
        }
        this.is_mouse_pressed = false;
    }

    /// Wiring: should be called only by the MapEditor
    /// which in turns is only be called when a layer
    /// is selected from the `layer-panel`
    onSelectLayer(id: number): void {
        // maybe?
        // this.map_handle.setActiveLayer(id);
        this.active_layer = id;
    }

    stateStr(): string {
        switch (this.state) {
            case State.Palette: return 'palette';
            case State.Editor: return 'editor';
        }
    }

    //////////////////////////////////////////////
    ///                Wiring                  ///
    //////////////////////////////////////////////

    keyPressed(event: KeyboardEvent) {
        // `P` key code
        if (event.keyCode === 80) {
            this.switchToState(State.Palette);
        // `ESC` key code
        } else if (this.state === State.Palette && event.keyCode === 27) {
            this.switchToState(State.Editor);
        }
    }

    mouseUp(event: MouseEvent): void {
        switch (this.state) {
            case State.Palette: return this.mouseUpPalette(event);
            case State.Editor: return this.mouseUpEditor(event);
        }
    }

    mouseDown(event: MouseEvent): void {
        switch (this.state) {
            case State.Palette: return this.mouseDownPalette(event);
            case State.Editor: return this.mouseDownEditor(event);
        }
    }

    mouseMove(event: MouseEvent): void {
        switch (this.state) {
            case State.Palette: return this.mouseMovePalette(event);
            case State.Editor: return this.mouseMoveEditor(event);
        }
    }

    mouseWheel(event: WheelEvent): void {
        switch (this.state) {
            case State.Palette: return this.mouseWheelPalette(event);
            case State.Editor: return this.mouseWheelEditor(event);
        }
    }


    //////////////////////////////////////////////
    ///             Editor State               ///
    //////////////////////////////////////////////

    private mouseUpEditor(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_editor.mouseUp(event.button, x, y);
        this.is_mouse_pressed = false;
    }

    private mouseDownEditor(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_editor.mouseDown(event.button, x, y);
        if (event.button === 0) {
            // TODO: Instead of always picking the same
            // layer, we should select the appropriate one
            let selected_layer = this.map_handle.select(this.active_layer, 0);
            this.brush.paint(selected_layer, x, y);
            this.is_mouse_pressed = true;
        }
    }

    private mouseMoveEditor(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_editor.mouseMove(event, x, y);

        if (this.is_mouse_pressed && this.map_handle) {
            // TODO: Should only be applied every
            // x that are distant from at least width
            // (same for y) to avoid erasing the
            // previous brush
            let selected_layer = this.map_handle.select(this.active_layer, 0);
            this.brush.paint(selected_layer, x, y);
        }

        this.brush.position(x, y);
    }

    private mouseWheelEditor(event: WheelEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_editor.mouseWheel(event.deltaY, x, y);
    }

    //////////////////////////////////////////////
    ///            Palette State               ///
    //////////////////////////////////////////////

    private mouseUpPalette(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_palette.mouseUp(event.button, x, y);
    }

    private mouseDownPalette(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_palette.mouseDown(event.button, x, y);
        // Prevent selection if button is not left mouse button.
        if (event.button === 0) {
            let new_id = this.chipset_palette.getTileIdFor(x, y, 16);
            if (new_id != 0) {
                this.brush.replaceWith(1, new_id);
                this.switchToState(State.Editor);
            }
        }
    }

    private mouseMovePalette(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_palette.mouseMove(event, x, y);
        // TODO: Refactor this part
        x = Math.floor(x / 16) * 16;
        y = Math.floor(y / 16) * 16;
        this.brush_area.position([x, y]);
    }

    private mouseWheelPalette(event: WheelEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_palette.mouseWheel(event.deltaY, x, y);
    }

    private objectSpace(event: MouseEvent): [number, number] {
        if (this.state == State.Editor) {
            return this.camera_editor.fromWindowCoordToObjectSpace(
                event.clientX, event.clientY - 63
            );
        } else {
            return this.camera_palette.fromWindowCoordToObjectSpace(
                event.clientX, event.clientY - 63
            );
        }
    }
}
