import {Component, View, AfterViewInit} from 'angular2/core';
import {UniqueId} from '../../services/index';
import {RenderingContext} from '../../rendering/context';
import {GenericRenderingContext} from '../../rendering/context';
import {TilesRenderingContext} from '../../rendering/context';
import {Camera} from '../../rendering/camera';
import {requestAnimationFrame} from '../../util/requestAnimationFrame';

@Component({
    selector: 'webgl-surface'
})
@View({
    styles: [`canvas { width: 100%; height: 100% }`],
    template: `<canvas id="{{id}}"
        (wheel)="wheelEvent($event)"
        (mousemove)="mouseMove($event)"
        (mousedown)="mouseDown($event)"
        (mouseup)="mouseUp($event)"></canvas>`
})
export class WebGLSurface implements AfterViewInit {

    private id: string;
    private gl: WebGLRenderingContext;
    private canvas: HTMLCanvasElement;
    private _loop: () => void;
    private camera: Camera = new Camera();
    private rendering_ctxs: RenderingContext[] = [];

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    ngAfterViewInit(): void {
        this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
        this.gl = (this.canvas.getContext('webgl') ||
            this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext;


        window.onresize = () => {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        };

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

    createGenericRenderingContext(): GenericRenderingContext {
        let render_ctx = new GenericRenderingContext(this.gl);
        this.rendering_ctxs.push(render_ctx);
        return render_ctx;
    }

    createTilesRenderingContext(): TilesRenderingContext {
        let render_ctx = new TilesRenderingContext(this.gl);
        this.rendering_ctxs.push(render_ctx);
        return render_ctx;
    }

    start(): void {
        setTimeout(() => {
            this.viewport();
            this._loop();
        }, 200);
    }

    private viewport() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.camera.viewport(this.canvas.width, this.canvas.height);
    }

    private loop() {
        let gl = this.gl;
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        for (let render_ctx of this.rendering_ctxs) {
            render_ctx.draw(this.camera);
        }
    }

    wheelEvent(event: WheelEvent) {
        if (event.deltaY < 0) {
            this.camera.zoom(0.1);
        } else {
            this.camera.zoom(-0.1);
        }
    }

    mouseDown(event: MouseEvent) {
        // console.log('MouseDown', event.button, event.clientX, event.clientY);
    }

    mouseMove(event: MouseEvent) {
        // console.log('MouseMove', event.clientX, event.clientY);
    }

    mouseUp(event: MouseEvent) {
        // console.log('MouseUp', event.button, event.clientX, event.clientY);
    }
}
