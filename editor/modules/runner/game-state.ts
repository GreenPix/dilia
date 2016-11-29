import {Injectable} from '@angular/core';

import {CommandBuffer, ClearAll, FlipY} from '../../rendering/commands';
import {SpriteProgram, TileProgram} from '../../rendering/shaders';
import {DefaultFBO} from '../../rendering/fbo';
import {Camera} from '../../rendering/camera';

import {MouseHandler, KeyHandler} from '../../components';
import {WebGLSurface} from '../../components';

import {Map} from '../../models/map';
import {PhysicsEngine} from './physics-engine';

import {LycanService} from '../../services/lycan';


@Injectable()
export class GameState implements MouseHandler, KeyHandler {

    private surface: WebGLSurface;
    private camera: Camera = new Camera();
    private physics: PhysicsEngine = new PhysicsEngine();

    constructor(private lycan: LycanService) {}

    init(surface: WebGLSurface) {
        this.surface = surface;
        this.surface.setKeyHandler(this);
        this.surface.setMouseHandler(this);
        this.surface.addViewportListener(this.camera);
    }

    cleanUp() {
        this.surface.removeViewportListener(this.camera);
        this.surface.setKeyHandler();
        this.surface.setMouseHandler();
    }

    play(map: Map) {
        let chipsets_pos: {[path: string]: number} = {};
        let chipsets_path: string[] = [];
        map.fillChipsetsInfo(chipsets_pos, chipsets_path);

        let map_tiled = this.surface.createTilesRenderEl();
        map_tiled.loadTileLayerObject(chipsets_path, (chipsets, builder) => {
            let handle = builder.setWidth(map.width)
                .setHeight(map.height)
                .tileSize(map.tile_size);
            for (let i = 0; i < map.layers.length; ++i) {
                let layer = map.layers[i].raw.map(pl => {
                    return {
                        tiles_id: pl.tiles_id,
                        chipset: chipsets[chipsets_pos[pl.chipset]]
                    };
                });
                handle.addLayer(layer);
            }
            this.camera.centerOn(handle.build());
        });
        let player = this.surface.createSpriteRenderEl();
        player.loadSpriteObject([125, 125, 125, 125], builder => {
            builder.buildWithSize(50, 200);
        });
        let pipeline = new CommandBuffer([
            DefaultFBO,
            ClearAll,
            new TileProgram(),
            this.camera,
            map_tiled,
            FlipY,
            new SpriteProgram(),
            this.camera,
            player,
        ]);

        this.surface.setActivePipeline(pipeline);
        this.surface.focus();
    }

    keyPressed(event: KeyboardEvent) {
        // FIXME
    }

    mouseDown(event: MouseEvent) {
        // FIXME
    }

    mouseUp(event: MouseEvent) {
        // FIXME
    }

    mouseMove(event: MouseEvent) {
        // FIXME
    }

    mouseWheel(event: WheelEvent) {
        // FIXME
    }
}
