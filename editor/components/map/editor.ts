import {Component, View, ViewChild} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');
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
export class MapEditor {

    @ViewChild(WebGLSurface)
    private surface: WebGLSurface;

    constructor() {}

    currentMapIsReadOnly() {
        return false;
    }

    afterViewInit(): void {
        this.surface.setShader(vertexShaderSrc, fragmentShaderSrc);
    }
}
