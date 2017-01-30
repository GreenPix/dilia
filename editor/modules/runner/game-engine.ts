import {Injectable} from '@angular/core';
import {ErrorReason} from '../../shared';

import {CommandBuffer, ClearAll, FlipY} from '../../rendering/commands';
import {SpriteProgram, TileProgram} from '../../rendering/shaders';
import {SpriteBatchProgram} from '../../rendering/shaders';
import {DefaultFBO} from '../../rendering/fbo';
import {Camera} from '../../rendering/camera';
import {SpriteHandle, SpriteBatchObject} from '../../rendering/sprite';

import {WebGLSurface} from '../../components';

import {Map} from '../../models/map';
import {PhysicsEngine} from './physics-engine';
import {GameInput} from './game-input';
import {GameState} from './game-state';
import {Player} from './player';
import {LycanService} from './lycan.service';
import {Hud} from './hud';


@Injectable()
export class GameEngine {

    private surface: WebGLSurface;
    private camera = new Camera();
    private last_time: number;
    private player_handle: SpriteHandle;
    private sprites: SpriteBatchObject;

    constructor(
        private lycan: LycanService,
        private input: GameInput,
        private world: GameState,
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
        });
        let player = this.surface.createSpriteRenderEl();
        player.loadSpriteObject([125, 125, 125, 255], builder => {
            this.player_handle = builder.buildWithSize(16, 24);
            this.camera.centerOn(this.player_handle);
        });
        let hud = new Hud(this.player, this.lycan, this.surface);
        let entities = this.surface.createSpriteBatchRenderEl();

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
            new SpriteBatchProgram(),
            this.camera,
            entities,
            hud,
            () => {
                let new_time = Date.now();
                if (!this.last_time) {
                    this.last_time = new_time;
                }
                let elapsed = (new_time - this.last_time) / 1000;
                this.input.update(elapsed);
                this.physics.update(elapsed);
                // TODO: Move that elsewhere.
                for (let i = 0; i < this.world.entities.length; ++i) {
                    let {x, y} = this.world.entities[i].pos;
                    this.sprites.setPos(i, x, y);
                }
                this.sprites.updatePositions();
                this.player_handle.position(
                    [this.player.pos.x, this.player.pos.y]
                );
                this.camera.centerOn(this.player_handle);
                this.last_time = new_time;
            }
        ]);

        this.surface.setActivePipeline(pipeline);
        this.surface.focus();

        // TODO(Nemikolh): Move this elsewhere.
        entities.loadSpriteObject([0, 125, 125, 255], sprites => {

            this.sprites = sprites;
            this.lycan.connectToLycan();
            this.lycan.authenticate();

            // When connected get the entities created.
            let obs = this.world.getEntityCountChangedObservable();

            obs.debounceTime(100)
                .subscribe(entities => {
                    let builder = sprites.makeBuilder(entities.length);
                    for (let entity of entities) {
                        let {x, y} = entity.pos;
                        x = x || 0;
                        y = y || 0;
                        builder.addSprite(x, y, 16, 24, 0, 0, 1, 1);
                    }
                    builder.build();
                    console.log(`Created ${entities.length} entities.`);
                });

        });

        this.lycan.getUpdateStream()
            .filter(v => v.kind === 'Error' && v.reason === ErrorReason.SocketClosed)
            .delay(1000)
            .do(() => console.log('Socket closed from lycan... Network issue?'))
            .do(() => this.lycan.reinitConnection())
            .subscribe(() => this.lycan.authenticate());
    }
}
