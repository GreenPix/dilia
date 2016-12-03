import {WebGLSurface} from '../../components';
import {Command, CommandBuffer} from '../../rendering/commands';
import {Camera} from '../../rendering/camera';
import {SpriteHandle} from '../../rendering/sprite';
import {Context} from '../../rendering/context';
import {LycanService} from './lycan.service';
import {Player} from './player';


export class Hud implements Command {

    private camera = new Camera();
    private interface: CommandBuffer;
    private lifebar: SpriteHandle;

    constructor(
        private player: Player,
        lycan: LycanService,
        surface: WebGLSurface,
    ) {
        surface.addViewportListener(this.camera);
        lycan.playerGameUpdateStream().subscribe(player_update => {
            this.setHealth(player_update.pv);
        });
        let lifebar = surface.createSpriteRenderEl();
        lifebar.loadSpriteObject([0, 255, 0, 255], builder => {
            this.lifebar = builder.buildWithSize(player.health, 16);
        });

        this.interface = new CommandBuffer([
            this.camera,
            lifebar
        ]);
    }

    execute(ctx: Context) {
        this.interface.execute(ctx);
    }

    private setHealth(health: number) {
        this.player.health = health;
        if (this.lifebar) {
            (this.lifebar as any).buildWithSize(health, 16);
        }
    }
}
