import {Component, AfterViewInit} from '@angular/core';
import {TextureLoader, Pixels} from '../../gl/gl';
import {SpriteProgram} from '../../rendering/shaders';
import {SpriteObject} from '../../rendering/sprite';
import {Context} from '../../rendering/context';
import {ClearAll} from '../../rendering/commands';
import * as uniqueId from 'lodash/uniqueId';
import {init_gl_default} from './helpers';


@Component({
    selector: 'img-webgl-surface',
    styles: [
        `canvas { width: 100%; height: 100% }`,
    ],
    template:
    `<canvas id="{{id}}" [ngClass] = "{'display-none': gl_not_supported }"></canvas>
     <div *ngIf="gl_not_supported">WebGL isn't supported by your browser. :(</div>`,
})
export class WebGLSingleTextureSurface implements AfterViewInit {

    private id: string = uniqueId('single-tex');
    private gl: WebGLRenderingContext;
    private gl_not_supported: boolean = false;
    private tex_loader: TextureLoader;
    private sprite: SpriteObject;
    private program: SpriteProgram = new SpriteProgram();

    loadTexture(pixels: Pixels) {
        this.tex_loader.loadTextureFromPixels(pixels, tex => {
            this.sprite.tex = tex;
            this.sprite.buildWithEntireTexture();
            setTimeout(() => this.refresh(), 10);
        });
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
        this.sprite = new SpriteObject(this.gl);
        init_gl_default(this.gl);
    }

    refresh() {
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;

        let ctx = new Context(this.gl);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        ClearAll.execute(ctx);
        this.program.execute(ctx);
        // TODO: this code assume that the texture is squared
        // and that the drawingBufferWidth is greater than drawingBufferHeight
        // this is true for the current usage but needs to fixed to support
        // any scenario.
        const ratio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        ctx.active_program.setUniforms({
            view_pos: [this.sprite.tex.width * (1 - ratio) / 2, 0],
            viewport_size: [
                this.sprite.tex.width * ratio,
                this.sprite.tex.height,
            ],
            flip_y: ctx.flip_y,
        });
        this.sprite.draw(ctx.gl, ctx.active_program);
    }
}
