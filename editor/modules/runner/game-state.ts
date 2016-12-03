import {Injectable} from '@angular/core';

import {CommandBuffer, ClearAll, FlipY} from '../../rendering/commands';
import {SpriteProgram, TileProgram} from '../../rendering/shaders';
import {DefaultFBO} from '../../rendering/fbo';
import {Camera} from '../../rendering/camera';
import {SpriteHandle} from '../../rendering/sprite';

import {WebGLSurface} from '../../components';

import {Map} from '../../models/map';
import {PhysicsEngine} from './physics-engine';
import {GameInput} from './game-input';
import {Player} from './player';
import {LycanService} from './lycan.service';
import {Hud} from './hud';


@Injectable()
export class GameState {

    private surface: WebGLSurface;
    private camera = new Camera();
    private last_time: number;
    private player_handle: SpriteHandle;

    constructor(
        private lycan: LycanService,
        private input: GameInput,
        private player: Player,
        private physics: PhysicsEngine,
    ) {}

    init(surface: WebGLSurface) {
        this.surface = surface;
        this.surface.setKeyHandler(this.input);
        this.surface.setMouseHandler(this.input);
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
        player.loadSpriteObject([125, 125, 125, 255], builder => {
            this.player_handle = builder.buildWithSize(16, 24);
        });
        let hud = new Hud(this.player, this.lycan, this.surface);

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
            hud,
            () => {
                let new_time = Date.now();
                if (!this.last_time) {
                    this.last_time = new_time;
                }
                this.input.update();
                this.physics.update((new_time - this.last_time) / 1000);
                this.last_time = new_time;
            }
        ]);

        this.surface.setActivePipeline(pipeline);
        this.surface.focus();
        this.lycan.connectToLycan();
        this.lycan.playerGameUpdateStream().subscribe(player_update => {
            this.player_handle.position(
                [player_update.position.x, player_update.position.y]
            );
        });
    }
}
