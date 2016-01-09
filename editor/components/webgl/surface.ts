import {Component, View} from 'angular2/core';
import {UniqueId} from '../../services/index';
import {Program} from '../../gl/gl';

@Component({
    selector: 'webgl-surface'
})
@View({
    styles: [`canvas { width: 100%; height: 100% }`],
    template: `<canvas id="{{id}}"></canvas>`
})
export class WebGLSurface {

    private id: string;
    private program: Program;
    private gl: WebGLRenderingContext;
    private canvas: HTMLCanvasElement;
    private _loop: () => void;

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    afterViewInit(): void {
        this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
        this.gl = (this.canvas.getContext('webgl') ||
            this.canvas.getContext('experimental-webgl')) as WebGLRenderingContext;

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

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

    setShader(vertexShaderSrc: string, fragmentShaderSrc: string) {
        this._loop();
        this.program = new Program(this.gl);
        this.program.src(vertexShaderSrc, fragmentShaderSrc);
    }

    loop() {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        this.program.use({
            location: this.program.uniform('proj')
        });
    }
}
