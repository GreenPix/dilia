import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import * as uniqueId from 'lodash/uniqueId';
import {TextureLoader} from '../../gl/gl';
import {DoNothing, Pipeline} from '../../rendering/pipeline';
import {ViewportListener} from '../../rendering/viewport';
import {requestAnimationFrame} from '../../util/requestAnimationFrame';
import {GenericRenderEl} from '../../rendering/draw';
import {SpriteRenderEl} from '../../rendering/draw';
import {TilesRenderEl} from '../../rendering/draw';

import {init_gl_default} from './helpers';


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
    selector: 'webgl-surface',
    styles: [
        `canvas { width: 100%; height: 100% }`,
    ],
    template: `<canvas id="{{id}}" tabindex="1"
        (keydown)="keyPressed($event)"
        (wheel)="wheelEvent($event)"
        (mousemove)="mouseMove($event)"
        (mousedown)="mouseDown($event)"
        (mouseup)="mouseUp($event)"
        [ngClass] = "{
            'display-none': gl_not_supported
        }"></canvas>
        <h3 *ngIf="gl_not_supported">WebGL isn't supported by your browser. :(</h3>`,
})
export class WebGLSurface implements AfterViewInit, OnDestroy {

    private id: string = uniqueId('surface');
    private gl: WebGLRenderingContext;
    private gl_not_supported: boolean = false;
    private tex_loader: TextureLoader;
    private _loop: () => void;
    private mouse_handler?: MouseHandler;
    private key_handler?: KeyHandler;
    private pipeline: Pipeline = DoNothing;
    private viewports_listeners: Array<ViewportListener> = [];

    focus() {
        this.gl.canvas.focus();
    }

    setMouseHandler(mouse_handler?: MouseHandler) {
        this.mouse_handler = mouse_handler;
    }

    setKeyHandler(key_handler?: KeyHandler) {
        this.key_handler = key_handler;
    }

    getGLContext(): WebGLRenderingContext {
        return this.gl;
    }

    getActivePipeline(): Pipeline {
        return this.pipeline;
    }

    setActivePipeline(pipeline?: Pipeline) {
        if (this.pipeline === DoNothing && pipeline) {
            this.pipeline = pipeline;
            this.start();
        } else if (pipeline){
            this.pipeline = pipeline;
            this.viewport();
        } else {
            this.pipeline = DoNothing;
        }
    }

    addViewportListener(viewport: ViewportListener) {
        let index = this.viewports_listeners.indexOf(viewport);
        if (index == -1) {
            this.viewports_listeners.push(viewport);
            this.viewport(viewport);
        }
    }

    removeViewportListener(viewport: ViewportListener) {
        let index = this.viewports_listeners.indexOf(viewport);
        if (index >= 0) {
            this.viewports_listeners.splice(index, 1);
        }
    }

    createGenericRenderingContext(): GenericRenderEl {
        let render_ctx = new GenericRenderEl(this.gl, this.tex_loader);
        return render_ctx;
    }

    createTilesRenderEl(): TilesRenderEl {
        let render_ctx = new TilesRenderEl(this.gl, this.tex_loader);
        return render_ctx;
    }

    createSpriteRenderEl(): SpriteRenderEl {
        let render_ctx = new SpriteRenderEl(this.gl, this.tex_loader);
        return render_ctx;
    }

    ngOnDestroy(): void {
        this._loop = () => {};
    }

    ngAfterViewInit(): void {
        let canvas = document.getElementById(this.id) as HTMLCanvasElement;
        this.gl = (canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')) as WebGLRenderingContext;

        if (!this.gl) {
            this.gl_not_supported = true;
            return;
        }

        this.tex_loader = new TextureLoader(this.gl);

        window.onresize = () => this.viewport();

        init_gl_default(this.gl);

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

    private viewport(viewport?: ViewportListener) {
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;
        if (viewport) {
            viewport.viewport(this.gl.canvas.width, this.gl.canvas.height);
        } else {
            for (let vp of this.viewports_listeners) {
                vp.viewport(this.gl.canvas.width, this.gl.canvas.height);
            }
        }
    }

    private loop() {
        this.pipeline.render(this.gl);
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
