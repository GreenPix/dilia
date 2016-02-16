import {WebGLSurface} from '../webgl/surface';
import {MouseHandler, KeyHandler} from '../webgl/surface';
import {Camera} from '../../rendering/camera';
import {SceneManager} from '../../rendering/scene';
import {TilesHandle} from '../../rendering/tiles';
import {SpriteHandle} from '../../rendering/sprite';

let vertex_shader_overlay_src = require<string>('./shaders/dark_overlay.vs');
let fragment_shader_overlay_src = require<string>('./shaders/dark_overlay.fs');

class Brush {
    width: number;
    tiles_ids: Uint16Array;
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
    private mouse_pos_editor: [number, number] = [0, 0];
    private mouse_pos_palette: [number, number] = [0, 0];
    private handles: TilesHandle[] = [];
    private sprite_under_mouse: SpriteHandle;
    private chipset_palette: SpriteHandle;
    private scene_editor: SceneManager;
    private scene_palette: SceneManager;
    private state: State = State.Editor;
    private surface: WebGLSurface;
    private tile_id: number = 93;

    init(surface: WebGLSurface) {

        let p1 = surface.createSpriteRenderingContext()
            .addSpriteObject('/api/chipset/0', builder => {
                this.chipset_palette = builder.buildWithEntireTexture();
                this.camera_palette.centerOn(this.chipset_palette);
            });

        let c2 = surface.createSpriteRenderingContext()
            .addSpriteObject('img/logo.png', b => b.buildWithEntireTexture());

        let c3 = surface.createTilesRenderingContext()
            .addTileLayerObject(['/api/chipset/0'], (chipsets, builder) => {
                let handle = builder.setWidth(10)
                    .setHeight(4)
                    .tileSize(16)
                    .addLayer([{
                        tiles_id: new Uint16Array([
                             0, 92, 92, 92, 91, 91, 91, 91, 91, 91,
                            91,  0, 91,  0,  0, 91, 91, 91, 91, 91,
                            91, 91,  0,  0,  0, 91, 91, 91, 91, 91,
                            92, 92, 92, 92, 92, 92, 92, 92, 92, 92
                        ]),
                        chipset: chipsets[0]
                    }])
                    .build();
                let s = handle.select(0, 0);
                s.setTileId(0.5, 0.5, 93);
                s.setTileId(17, 17, 93);
                s.setTileId(3 * 16 +1, 16 + 1, 93);
                this.handles.push(handle);
                this.camera_editor.centerOn(handle);
            });

        let c4 = surface.createSpriteRenderingContext()
            .addSpriteObject('/api/chipset/0', builder => {
                this.sprite_under_mouse = builder
                    .overlayFlag(true)
                    .buildFromTileId(16, this.tile_id);

                surface.setMouseHandler(this);
            });

        let p0 = surface.createGenericRenderingContext()
            .setShader(vertex_shader_overlay_src, fragment_shader_overlay_src)
            .addVertexBuffer('position', [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1], 2);

        this.scene_editor = new SceneManager([
            this.camera_editor,
            // c2,
            c3,
            c4
        ]);

        this.scene_palette = new SceneManager([
            this.camera_editor,
            // c2,
            c3,
            this.camera_palette,
            p0,
            p1,
        ]);

        surface.setSceneManager(this.scene_editor);
        surface.setKeyHandler(this);
        this.surface = surface;
    }

    cleanUp() {
        this.surface.setSceneManager(undefined);
        this.surface.setMouseHandler(undefined);
        this.handles.splice(0, this.handles.length);
        this.sprite_under_mouse = undefined;
        this.surface = undefined;
    }

    //////////////////////////////////////////////
    ///            State changes               ///
    //////////////////////////////////////////////

    private switchToState(state: State) {
        this.state = state;
        if (this.surface && this.scene_editor && this.scene_palette) {
            if (this.state == State.Palette) {
                this.surface.setSceneManager(this.scene_palette);
            } else {
                this.surface.setSceneManager(this.scene_editor);
            }
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

    }

    private mouseDownEditor(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.handles[0].select(0, 0)
            .setTileId(x, y, this.tile_id);
    }

    private mouseMoveEditor(event: MouseEvent): void {
        if (this.sprite_under_mouse) {
            let [x, y] = this.objectSpace(event);
            x = Math.floor(x / 16) * 16;
            y = Math.floor(y / 16) * 16;
            this.sprite_under_mouse.position([x, y]);
        }
    }

    private mouseWheelEditor(event: WheelEvent): void {
        this.mouse_pos_editor = this.objectSpace(event);
        if (event.deltaY < 0) {
            this.camera_editor.zoom(0.1, this.mouse_pos_editor);
        } else {
            this.camera_editor.zoom(-0.1, this.mouse_pos_editor);
        }
    }

    //////////////////////////////////////////////
    ///            Palette State               ///
    //////////////////////////////////////////////

    private mouseUpPalette(event: MouseEvent): void {

    }

    private mouseDownPalette(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        let new_id = this.chipset_palette.getTileIdFor(x, y, 16);
        if (new_id != 0) {
            this.tile_id = new_id;
            // Ugly hack fix this and have a proper function.
            (this.sprite_under_mouse as any).buildFromTileId(16, new_id);
            this.switchToState(State.Editor);
        }
    }

    private mouseMovePalette(event: MouseEvent): void {
    }

    private mouseWheelPalette(event: WheelEvent): void {
        this.mouse_pos_palette = this.objectSpace(event);
        if (event.deltaY < 0) {
            this.camera_palette.zoom(0.1, this.mouse_pos_palette);
        } else {
            this.camera_palette.zoom(-0.1, this.mouse_pos_palette);
        }
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
