import {Component, View, AfterViewInit} from 'angular2/core';
import {UniqueId} from '../../services/index';
import {Program, VertexBuffer} from '../../gl/gl';
import {TextureLoader, Geom, glDrawBuffers} from '../../gl/gl';
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
    private tex_loader: TextureLoader;
    private uniforms_values: { [name: string]: any } = {};
    private resources_not_yet_loaded: number = 0;
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

        this.tex_loader = new TextureLoader(this.gl);

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

    setTexture(uniform_name: string, path: string): this {
        this.resources_not_yet_loaded += 1;
        this.tex_loader.loadTexture(path, tex => {
            this.uniforms_values[uniform_name] = tex;
            this.resources_not_yet_loaded -= 1;
        });
        return this;
    }

    addVertexBuffer(attr_name: string, values: number[], vec_size: number): this {
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

    setUniform(uniform_name: string, value: any): this {
        this.uniforms_values[uniform_name] = value;
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
        if (this.buffers.length > 0 && this.indices && this.resources_not_yet_loaded === 0) {
            glDrawBuffers(
                Geom.TRIANGLES,
                this.program,
                this.uniforms_values,
                this.indices, ...this.buffers);
        }
    }
}
