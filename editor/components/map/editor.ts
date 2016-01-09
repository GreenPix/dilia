import {Component, View} from 'angular2/core';
import {UniqueId} from '../../services/index';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');

@Component({
    selector: 'map-editor',
})
@View({
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate
})
export class MapEditor {

    private id: string;
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private _loop: () => void;

    constructor(id: UniqueId) {
        this.id = id.get();
    }

    afterViewInit(): void {
        this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
        this.gl = this.canvas.getContext('webgl') as WebGLRenderingContext;

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

        this._loop();
    }

    loop() {
        let gl = this.gl;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    }
}
