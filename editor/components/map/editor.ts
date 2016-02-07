import {Component, View, ViewChild, AfterViewInit} from 'angular2/core';
import {WebGLSurface} from '../webgl/surface';
import {ChipsetModal} from './chipset';
import {TilesHandle} from '../../rendering/tiles';
import {SpriteHandle} from '../../rendering/sprite';
import {MapManager} from '../../models/map';

let mapEditorTemplate = require<string>('./editor.html');
let mapEditorScss = require<Webpack.Scss>('./editor.scss');
let vertex_shader_triangle_src = require<string>('./shaders/triangle.vs');
let fragment_shader_triangle_src = require<string>('./shaders/triangle.fs');

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

    private handles: TilesHandle[] = [];
    private sprite_under_mouse: SpriteHandle;

    constructor(
        private map_manager: MapManager
    ) {}

    currentMapIsReadOnly() {
        return false;
    }

    uploadChipset() {
        this.chipset_modal.show();
    }

    openMap(map: any) {
        this.map_manager.openMap(map);
    }

    selectLayer(index: number) {
        this.map_manager.selectLayer(index);
    }

    ngAfterViewInit(): void {

        // TODO: CLEAN UP THIS MESS
        // This is really temporary and only for testing purpose. :)

        this.surface.setMouseHandler({
            mouseUp: (camera, event) => {

            },
            mouseDown: (c, e) => {
                let [x, y] = c.fromWindowCoordToObjectSpace(e.clientX, e.clientY - 63);
                this.handles[0].select(0, 0)
                    .setTileId(x, y, 93);
            },
            mouseMove: (c, e) => {
                let [x, y] = c.fromWindowCoordToObjectSpace(e.clientX, e.clientY - 63);
                x = Math.floor(x / 16) * 16;
                y = Math.floor(y / 16) * 16;
                this.sprite_under_mouse.position([x, y]);
            },
            mouseWheel: (c, e) => {

            }
        });

        this.surface.createGenericRenderingContext()
            .setShader(vertex_shader_triangle_src, fragment_shader_triangle_src)
            .addVertexBuffer('position', [-0.5, -0.5, 0, 0.5, 0.5, 0], 2)
            .addVertexBuffer('color', [0, 1, 0, 1, 0, 0, 0, 0, 1], 3);
            // .setIndicesBuffer([0, 1, 2]);

        this.surface.createSpriteRenderingContext()
            .addSpriteObject('img/logo.png', b => b.buildWithEntireTexture());

        this.surface.createTilesRenderingContext()
            .addTileLayerObject(['/api/chipset/0'], (chipsets, builder) => {
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

        this.surface.createSpriteRenderingContext()
            .addSpriteObject('/api/chipset/0', builder => {
                this.sprite_under_mouse = builder
                    .overlayFlag(true)
                    .buildFromTileId(16, 93);
                // builder.buildWithEntireTexture();
            });

        this.surface.start();
    }
}
