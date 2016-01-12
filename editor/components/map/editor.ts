import {Component, View, ViewChild, AfterViewInit} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');
// let vertexShaderSrc = require<string>('./shaders/triangle.vs');
// let fragmentShaderSrc = require<string>('./shaders/triangle.fs');
let vertexShaderSrc = require<string>('./shaders/tiles.vs');
let fragmentShaderSrc = require<string>('./shaders/tiles.fs');



@Component({
    selector: 'map-editor',
})
@View({
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate,
    directives: [WebGLSurface]
})
export class MapEditor implements AfterViewInit {

    @ViewChild(WebGLSurface)
    private surface: WebGLSurface;

    constructor() {}

    currentMapIsReadOnly() {
        return false;
    }

    ngAfterViewInit(): void {
        // this.surface.setShader(vertexShaderSrc, fragmentShaderSrc)
        //     .addVertexBuffer([-0.5, -0.5, 0, 0.5, 0.5, 0], 2, 'position')
        //     .addVertexBuffer([0, 1, 0, 1, 0, 0, 0, 0, 1], 3, 'color')
        //     .setIndicesBuffer([0, 1, 2])
        //     .start();
        this.surface.createRenderingContext()
            .setShader(vertexShaderSrc, fragmentShaderSrc)
            .setUniform('proj', [1, 0, 0, 1])
            .setTexture('texture', 'img/logo.png')
            .addVertexBuffer('pos', [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5], 2)
            .addVertexBuffer('texCoord', [0, 0, 0, 1, 1, 1, 1, 0], 2)
            .setIndicesBuffer([0, 1, 2, 0, 2, 3]);
        this.surface.start();
    }
}
