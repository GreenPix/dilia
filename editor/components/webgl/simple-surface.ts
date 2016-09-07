import {Component, AfterViewInit, OnDestroy} from '@angular/core';
import {TextureLoader, Pixels} from '../../gl/gl';
import {SpriteProgram} from '../../rendering/shaders';
import {SpriteObject} from '../../rendering/sprite';
import * as uniqueId from 'lodash/uniqueId';
import {init_gl_default} from './helpers';


@Component({
    selector: 'img-webgl-surface',
    styles: [
        `canvas { width: 100%; height: 100% }`,
        `.display-none { display: none; }`
    ],
    template:
    `<canvas id="{{id}}" [ngClass] = "{'display-none': gl_not_supported }"></canvas>
     <div *ngIf="gl_not_supported">WebGL isn't supported by your browser. :(</div>`,
})
export class WebGLSingleTextureSurface implements AfterViewInit, OnDestroy {

    private id: string = uniqueId('single-tex');
    private gl: WebGLRenderingContext;
    private gl_not_supported: boolean = false;
    private tex_loader: TextureLoader;
    private sprite: SpriteObject;
    private program: SpriteProgram = new SpriteProgram();

    ngOnDestroy(): void {
        this.gl = undefined;
    }

    loadTexture(pixels: Pixels) {
        this.tex_loader.loadTextureFromPixels(pixels, tex => {
            this.sprite.tex = tex;
            this.sprite.buildWithEntireTexture();
            this.refresh();
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
        let ctx = { gl: this.gl, active_program: null, flip_y: true };
        this.program.execute(ctx);
        this.sprite.draw(ctx.gl, ctx.active_program);
    }
}
