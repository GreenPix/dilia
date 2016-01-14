import {Component, View, ViewChild, AfterViewInit} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');
let vertex_shader_triangle_src = require<string>('./shaders/triangle.vs');
let fragment_shader_triangle_src = require<string>('./shaders/triangle.fs');
let vertex_shader_src = require<string>('./shaders/tiles.vs');
let fragment_shader_src = require<string>('./shaders/tiles.fs');



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
        this.surface.createRenderingContext()
            .setShader(vertex_shader_triangle_src, fragment_shader_triangle_src)
            .addVertexBuffer('position', [-0.5, -0.5, 0, 0.5, 0.5, 0], 2)
            .addVertexBuffer('color', [0, 1, 0, 1, 0, 0, 0, 0, 1], 3)
            .setIndicesBuffer([0, 1, 2]);

        this.surface.createRenderingContext()
            .setShader(vertex_shader_src, fragment_shader_src)
            .setUniform('proj', [1, 0, 0, 1])
            .setTexture('texture', 'img/logo.png')
            .addVertexBuffer('pos', [-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5], 2)
            .addVertexBuffer('texCoord', [0, 0, 0, 1, 1, 1, 1, 0], 2)
            .setIndicesBuffer([0, 1, 2, 0, 2, 3]);
        this.surface.start();
    }
}
