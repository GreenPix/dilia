import {WebGLSurface} from '../webgl/surface';
import {MouseHandler, KeyHandler} from '../webgl/surface';
import {Camera} from '../../rendering/camera';
import {ZoomBehavior} from '../webgl/zoom';
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

    private zbehavior_editor: ZoomBehavior;
    private zbehavior_palette: ZoomBehavior;

    private handles: TilesHandle[] = [];
    private sprite_under_mouse: SpriteHandle;
    private chipset_palette: SpriteHandle;

    private scene_editor: SceneManager;
    private scene_palette: SceneManager;
    private state: State = State.Editor;
    private is_mouse_pressed: boolean = false;
    private tile_id: number = 93;

    private surface: WebGLSurface;

    constructor() {
        this.zbehavior_editor = new ZoomBehavior(this.camera_editor);
        this.zbehavior_palette = new ZoomBehavior(this.camera_palette);
    }

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
                this.zbehavior_editor.desactivate();
                this.surface.setSceneManager(this.scene_palette);
            } else {
                this.zbehavior_palette.desactivate();
                this.surface.setSceneManager(this.scene_editor);
            }
        }
        this.is_mouse_pressed = false;
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
            this.handles[0].select(0, 0)
            .setTileId(x, y, this.tile_id);
            this.is_mouse_pressed = true;
        }
    }

    private mouseMoveEditor(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_editor.mouseMove(event, x, y);
        x = Math.floor(x / 16) * 16;
        y = Math.floor(y / 16) * 16;

        if (this.is_mouse_pressed && this.handles.length > 0) {
            this.handles[0].select(0, 0)
            .setTileId(x, y, this.tile_id);
        }

        if (this.sprite_under_mouse) {
            this.sprite_under_mouse.position([x, y]);
        }
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
        let new_id = this.chipset_palette.getTileIdFor(x, y, 16);
        if (new_id != 0) {
            this.tile_id = new_id;
            // Ugly hack fix this and have a proper function.
            (this.sprite_under_mouse as any).buildFromTileId(16, new_id);
            this.switchToState(State.Editor);
        }
    }

    private mouseMovePalette(event: MouseEvent): void {
        let [x, y] = this.objectSpace(event);
        this.zbehavior_palette.mouseMove(event, x, y);
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
