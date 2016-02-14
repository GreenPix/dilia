import {Component, View, AfterViewInit, OnDestroy} from 'angular2/core';
import {TextureLoader} from '../../gl/gl';
import {UniqueId} from '../../services/index';
import {SceneManager} from '../../rendering/scene';
import {requestAnimationFrame} from '../../util/requestAnimationFrame';
import {GenericRenderingContext} from '../../rendering/context';
import {SpriteRenderingContext} from '../../rendering/context';
import {TilesRenderingContext} from '../../rendering/context';

export interface MouseHandler {
    mouseWheel(event: WheelEvent): void;
    mouseMove(event: MouseEvent): void;
    mouseDown(event: MouseEvent): void;
    mouseUp(event: MouseEvent): void;
}

export interface KeyHandler {
    keyPressed(event: KeyboardEvent): void;
}

@Component({
    selector: 'webgl-surface'
})
@View({
    styles: [`canvas { width: 100%; height: 100% }`],
    template: `<canvas id="{{id}}" tabindex="1"
        (keydown)="keyPressed($event)"
        (wheel)="wheelEvent($event)"
        (mousemove)="mouseMove($event)"
        (mousedown)="mouseDown($event)"
        (mouseup)="mouseUp($event)"></canvas>`
})
export class WebGLSurface implements AfterViewInit, OnDestroy {

    private id: string;
    private gl: WebGLRenderingContext;
    private tex_loader: TextureLoader;
    private canvas: HTMLCanvasElement;
    private _loop: () => void;
    private mouse_handler: MouseHandler;
    private key_handler: KeyHandler;
    private scene: SceneManager = undefined;

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    setMouseHandler(mouse_handler: MouseHandler) {
        this.mouse_handler = mouse_handler;
    }

    setKeyHandler(key_handler: KeyHandler) {
        this.key_handler = key_handler;
    }

    setSceneManager(scene_manager: SceneManager) {
        if (this.scene === undefined) {
            this.scene = scene_manager;
            this.start();
        } else if (scene_manager != undefined){
            this.scene = scene_manager;
            this.viewport();
        } else {
            this.scene = new SceneManager([]);
        }
    }

    createGenericRenderingContext(): GenericRenderingContext {
        let render_ctx = new GenericRenderingContext(this.gl, this.tex_loader);
        return render_ctx;
    }

    createTilesRenderingContext(): TilesRenderingContext {
        let render_ctx = new TilesRenderingContext(this.gl, this.tex_loader);
        return render_ctx;
    }

    createSpriteRenderingContext(): SpriteRenderingContext {
        let render_ctx = new SpriteRenderingContext(this.gl, this.tex_loader);
        return render_ctx;
    }

    ngOnDestroy(): void {
        this._loop = () => {
            this.gl = undefined;
            this.canvas = undefined;
        };
    }

    ngAfterViewInit(): void {
        this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
        this.gl = (this.canvas.getContext('webgl') ||
            this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
        this.tex_loader = new TextureLoader(this.gl);

        window.onresize = () => this.viewport();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFuncSeparate(
            this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA,
            this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA
        );

        this._loop = () => {
            this.loop();
            requestAnimationFrame(this._loop);
        };
    }

    private start(): void {
        setTimeout(() => {
            this.viewport();
            this._loop();
        }, 200);
    }

    private viewport() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.scene.viewport(this.canvas.width, this.canvas.height);
    }

    private loop() {
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
        this.scene.draw();
    }

    wheelEvent(event: WheelEvent) {
        if (this.mouse_handler) {
            this.mouse_handler.mouseWheel(event);
        }
    }

    mouseDown(event: MouseEvent) {
        if (this.mouse_handler) {
            this.mouse_handler.mouseDown(event);
        }
    }

    mouseMove(event: MouseEvent) {
        if (this.mouse_handler) {
            this.mouse_handler.mouseMove(event);
        }
    }

    mouseUp(event: MouseEvent) {
        if (this.mouse_handler) {
            this.mouse_handler.mouseUp(event);
        }
    }

    keyPressed(event: KeyboardEvent) {
        if (this.key_handler) {
            this.key_handler.keyPressed(event);
        }
    }
}
