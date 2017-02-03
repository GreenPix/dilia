import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {WebGLSurface} from '../../../components';
import {MouseHandler, KeyHandler} from '../../../components';
import {Map} from '../../../models/map';
import {EditorArea} from './editor-area';
import {PaletteArea} from './palette-area';
import {OneFrameSaveSwapBack} from './preview';
import {Brush} from './brush';

export enum State {
    Palette,
    Editor
}

@Injectable()
export class EditorState implements MouseHandler, KeyHandler {

    // TODO: this value should be in a model
    //       and be managed by the LayersPanel component.
    private active_layer: number = 0;
    private state: State = State.Editor;
    private surface: WebGLSurface;

    constructor(
        private brush: Brush,
        private editor_area: EditorArea,
        private palette_area: PaletteArea
    ) {}

    init(surface: WebGLSurface) {
        this.surface = surface;
        this.surface.setKeyHandler(this);
        this.surface.setMouseHandler(this);
        this.palette_area.setSurface(this.surface);
        this.editor_area.setSurface(this.surface);
        this.brush.setSurface(this.surface);
    }

    getMapPreview(): Observable<string> {
        let subject = new Subject<string>();
        this.surface.setActivePipeline(new OneFrameSaveSwapBack(
            this.surface.getActivePipeline(),
            this.editor_area.getPreviewScene(),
            this.surface,
            subject
        ));
        return subject;
    }

    edit(map: Map) {
        this.editor_area.load(map);
        this.brush.setMap(map);

        this.surface.setActivePipeline(this.editor_area.getScene());
        this.surface.focus();
    }

    cleanUp() {
        this.editor_area.cleanUp();
        this.palette_area.cleanUp();
        this.surface.setActivePipeline();
        this.surface.setMouseHandler();
        this.surface.setKeyHandler();
        this.brush.sprite = undefined;
    }

    //////////////////////////////////////////////
    ///            State changes               ///
    //////////////////////////////////////////////

    private switchToState(state: State) {
        this.state = state;
        if (this.isReady()) {
            if (this.state === State.Palette) {
                this.editor_area.deactivate();
                this.palette_area.activate();
                this.surface.setActivePipeline(this.palette_area.getScene());
            } else {
                this.palette_area.deactivate();
                this.editor_area.activate();
                this.surface.setActivePipeline(this.editor_area.getScene());
            }
        }
    }

    private isReady(): boolean {
        return this.surface && this.editor_area.isReady()
            && this.palette_area.isReady();
    }

    /// Wiring: should be called only by the MapEditor
    /// which in turns is only be called when a layer
    /// is selected from the `layer-panel`
    onSelectLayer(id: number): void {
        // maybe?
        // this.map_handle.setActiveLayer(id);
        this.surface.focus();
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

    keyReleased() {}

    mouseUp(event: MouseEvent): void {
        if (!this.isReady()) return;
        let next_state: State;
        switch (this.state) {
            case State.Palette: next_state = this.palette_area.mouseUpPalette(event); break;
            case State.Editor: next_state = this.editor_area.mouseUpEditor(event); break;
            default: throw 'Unreachable code reached';
        }
        if (this.state !== next_state) {
            this.switchToState(next_state);
        }
    }

    mouseDown(event: MouseEvent): void {
        if (!this.isReady()) return;
        let next_state: State;
        switch (this.state) {
            case State.Palette: next_state = this.palette_area.mouseDownPalette(event); break;
            case State.Editor: next_state = this.editor_area.mouseDownEditor(event); break;
            default: throw 'Unreachable code reached';
        }
        if (this.state !== next_state) {
            this.switchToState(next_state);
        }
    }

    mouseMove(event: MouseEvent): void {
        if (!this.isReady()) return;
        let next_state: State;
        switch (this.state) {
            case State.Palette: next_state = this.palette_area.mouseMovePalette(event); break;
            case State.Editor: next_state = this.editor_area.mouseMoveEditor(event); break;
            default: throw 'Unreachable code reached';
        }
        if (this.state !== next_state) {
            this.switchToState(next_state);
        }
    }

    mouseWheel(event: WheelEvent): void {
        if (!this.isReady()) return;
        let next_state: State;
        switch (this.state) {
            case State.Palette: next_state = this.palette_area.mouseWheelPalette(event); break;
            case State.Editor: next_state = this.editor_area.mouseWheelEditor(event); break;
            default: throw 'Unreachable code reached';
        }
        if (this.state !== next_state) {
            this.switchToState(next_state);
        }
    }
}
