import {Component, View, AfterViewInit} from 'angular2/core';
import {UniqueId} from '../../services/index';
import {Program, VertexBuffer} from '../../gl/gl';
import {Geom, glDrawBuffers} from '../../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../../gl/gl';

@Component({
    selector: 'webgl-surface'
})
@View({
    styles: [`canvas { width: 100%; height: 100% }`],
    template: `<canvas id="{{id}}"></canvas>`
})
export class WebGLSurface implements AfterViewInit {

    private id: string;
    private program: Program;
    private gl: WebGLRenderingContext;
    private canvas: HTMLCanvasElement;
    private buffers: BufferLinkedToProgram[] = [];
    private indices: IndicesBuffer;
    private _loop: () => void;

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

        this._loop = () => {
            this.loop();
            setTimeout(this._loop, 200);
        };
    }

    setShader(vertexShaderSrc: string, fragmentShaderSrc: string): this {
        this.program = new Program(this.gl);
        this.program.src(vertexShaderSrc, fragmentShaderSrc);
        return this;
    }

    addVertexBuffer(values: number[], vec_size: number, attr_name: string): this {
        let buffer = new VertexBuffer(this.gl)
            .fill(values).numberOfComponents(vec_size);
        let blinked = new BufferLinkedToProgram(this.program, buffer, attr_name);
        this.buffers.push(blinked);
        return this;
    }

    setIndicesBuffer(indices: number[]): this {
        this.indices = new IndicesBuffer(this.gl).fill(indices);
        return this;
    }

    start(): void {
        setTimeout(() => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this._loop();
        }, 200);
    }

    private loop() {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        if (this.buffers.length > 0 && this.indices) {
            glDrawBuffers(Geom.TRIANGLES, this.program, this.indices, ...this.buffers);
        }
    }
}
