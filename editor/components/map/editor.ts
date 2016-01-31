import {Component, View, ViewChild, AfterViewInit} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';
import {ChipsetModal} from './chipset';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');
let vertex_shader_triangle_src = require<string>('./shaders/triangle.vs');
let fragment_shader_triangle_src = require<string>('./shaders/triangle.fs');
let vertex_shader_src = require<string>('./shaders/sprite.vs');
let fragment_shader_src = require<string>('./shaders/sprite.fs');



@Component({
    selector: 'map-editor',
})
@View({
    styles: [mapEditorScss.toString()],
    templateUrl: mapEditorTemplate,
    directives: [WebGLSurface, ChipsetModal]
})
export class MapEditor implements AfterViewInit {

    @ViewChild(WebGLSurface)
    private surface: WebGLSurface;

    @ViewChild(ChipsetModal)
    private chipset_modal: ChipsetModal;

    constructor() {}

    currentMapIsReadOnly() {
        return false;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    ngAfterViewInit(): void {
        this.surface.createGenericRenderingContext()
            .setShader(vertex_shader_triangle_src, fragment_shader_triangle_src)
            .addVertexBuffer('position', [-0.5, -0.5, 0, 0.5, 0.5, 0], 2)
            .addVertexBuffer('color', [0, 1, 0, 1, 0, 0, 0, 0, 1], 3);
            // .setIndicesBuffer([0, 1, 2]);

        this.surface.createGenericRenderingContext()
            .setShader(vertex_shader_src, fragment_shader_src)
            .setTexture('texture', 'img/logo.png')
            .addVertexBuffer('pos', [-123.7, -53.5, -123.7, 53.5, 123.7, 53.5, 123.7, -53.5], 2)
            .addVertexBuffer('texCoord', [0, 0, 0, 1, 1, 1, 1, 0], 2)
            .setIndicesBuffer([0, 1, 2, 0, 2, 3]);

        this.surface.createTilesRenderingContext()
            .addObject(['/api/chipset/0'], (chipsets, builder) => {
                builder.setWidth(10)
                    .setHeight(4)
                    .tileSize(16)
                    .addLayer([{
                        tiles_id: new Uint16Array([
                             0, 92, 92, 92, 91, 91, 91, 91, 91, 91,
                            91,  0, 91,  0,  0, 91, 91, 91, 91, 91,
                            91, 91,  0,  0,  0, 91, 91, 91, 91, 91,
                            92, 92, 92, 92, 92, 92, 92, 92, 92, 92
                        ]),
                        chipset: chipsets[0]
                    }]);
            });

        this.surface.start();
    }
}
