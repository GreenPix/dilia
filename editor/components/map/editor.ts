import {Component, View, ViewChild, AfterViewInit} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';
import {ChipsetModal} from './chipset';
import {TilesHandle} from '../../rendering/tiles';

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

    private current_edited_layer: number = 0;
    private handles: TilesHandle[] = [];

    constructor() {}

    currentMapIsReadOnly() {
        return false;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    openMap(map: any) {
        // TODO
        this.current_edited_layer = 0;
    }

    selectLayer(index: number) {
        this.current_edited_layer = index;
    }

    ngAfterViewInit(): void {
        this.surface.setMouseHandler({
            mouseUp: (camera, event) => {

            },
            mouseDown: (c, e) => {
                let [x, y] = c.fromWindowCoordToObjectSpace(e.clientX, e.clientY);
                this.handles[0].select(0, 0)
                    .setTileId(x, y, 93);
            },
            mouseMove: (c, e) => {

            },
            mouseWheel: (c, e) => {

            }
        });

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
                let handle = builder.setWidth(10)
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
                    }])
                    .build();
                let s = handle.select(0, 0);
                s.setTileId(0.5, 0.5, 93);
                s.setTileId(17, 17, 93);
                s.setTileId(3 * 16 +1, 16 + 1, 93);
                this.handles.push(handle);
            });

        this.surface.start();
    }
}
