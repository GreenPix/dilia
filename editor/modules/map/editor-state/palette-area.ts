import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {WebGLSurface} from '../../../components';
import {DefaultFBO} from '../../../rendering/fbo';
import {SpriteHandle} from '../../../rendering/sprite';
import {CommandBuffer, ClearAll, FlipY} from '../../../rendering/commands';
import {SpriteProgram} from '../../../rendering/shaders';
import {ChipsetService} from '../chipset.service';
import {Brush} from './brush';
import {State} from './index';
import {Area} from './area';

let vertex_shader_overlay_src = require<string>('./shaders/dark_overlay.vs');
let fragment_shader_overlay_src = require<string>('./shaders/dark_overlay.fs');

@Injectable()
export class PaletteArea extends Area {

    private brush_area: SpriteHandle;
    private chipset?: SpriteHandle;
    private chipset_name: string;

    constructor(
        private brush: Brush,
        private chipset_service: ChipsetService
    ) {
        super();
    }

    activate() {}
    deactivate() {
        this.zbehavior.desactivate();
    }

    setSurface(surface: WebGLSurface) {
        super.setSurface(surface);
        this.load();
    }

    private load() {
        // Create empty scene until we have loaded all chipsets
        this.scene = new CommandBuffer([DefaultFBO, ClearAll]);

        // Create a palette for future use.
        let palette = this.surface.createSpriteRenderEl();
        let brush = this.surface.createSpriteRenderEl().loadSpriteObject(
            [51, 122, 183, 178],
            builder => this.brush_area = builder.buildWithSize(16, 16)
        );

        this.chipset_service.getChipsetList()
            .do(() => this.chipset = undefined)
            .flatMap(chip_list => chip_list)
            .map(chip => this.chipset_service.getChipsetPath(chip))
            .switchMap(chip_path => {
                if (this.chipset) {
                    console.log(`Handle more than one chipset`);
                    return [];
                }
                this.chipset_name = chip_path;
                let observable = new Observable<void>((subscriber: Subscriber<void>) => {
                    palette.loadSpriteObject(chip_path, builder => {
                        this.chipset = builder.buildWithEntireTexture();
                        this.camera.centerOn(this.chipset);
                        subscriber.next();
                    });
                });
                return observable;
            }).subscribe(() => {
                if (!this.chipset) {
                    console.log(`No chipset found!`);
                    return;
                }
                let overlay = this.surface.createGenericRenderingContext()
                    .setShader(vertex_shader_overlay_src, fragment_shader_overlay_src)
                    .addVertexBuffer('position', [-1, -1, -1, 1, 1, 1, -1, -1, 1, 1, 1, -1], 2);

                this.scene = new CommandBuffer([
                    DefaultFBO,
                    ClearAll,
                    FlipY,
                    overlay,
                    new SpriteProgram(),
                    this.camera,
                    palette,
                    brush
                ]);
            }, err => console.log(`Error while loading chipsets: ${err}`));
    }

    //////////////////////////////////////////////
    ///            Palette State               ///
    //////////////////////////////////////////////

    mouseUpPalette(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseUp(event.button, x, y);
        return State.Palette;
    }

    mouseDownPalette(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseDown(event.button, x, y);
        // Prevent selection if button is not left mouse button.
        if (event.button === 0 && this.chipset) {
            let new_id = this.chipset.getTileIdFor(x, y, 16);
            if (new_id != 0) {
                this.brush.replaceWith(1, new_id, this.chipset.tex, this.chipset_name);
                return State.Editor;
            }
        }
        return State.Palette;
    }

    mouseMovePalette(event: MouseEvent): State {
        let [x, y] = this.objectSpace(event);
        this.zbehavior.mouseMove(event, x, y);
        // TODO: Refactor this part
        x = Math.floor(x / 16) * 16;
        y = Math.floor(y / 16) * 16;
        this.brush_area.position([x, y]);
        return State.Palette;
    }

    mouseWheelPalette(event: WheelEvent): State {
        this.zbehavior.mouseWheel(event);
        return State.Palette;
    }

    private objectSpace(event: MouseEvent): [number, number] {
        return this.camera.fromWindowCoordToObjectSpace(
            event.clientX, event.clientY - 63
        );
    }
}
