import {DefaultFBO} from '../../../rendering/fbo';
import {SpriteHandle} from '../../../rendering/sprite';
import {CommandBuffer, ClearAll, FlipY} from '../../../rendering/pipeline';
import {SpriteProgram} from '../../../rendering/shaders';
import {ChipsetService} from '../chipset.service';
import {fromBase64} from '../../../util/base64';
import {Brush} from './brush';
import {State} from './index';
import {Area} from './area';

let vertex_shader_overlay_src = require<string>('./shaders/dark_overlay.vs');
let fragment_shader_overlay_src = require<string>('./shaders/dark_overlay.fs');

export class PaletteArea extends Area {

    private brush_area: SpriteHandle;
    private chipset: SpriteHandle;

    constructor(
        private brush: Brush,
        private chipset_service: ChipsetService
    ) {
        super();
        this.load()
    }

    activate() {}
    deactivate() {
        this.zbehavior.desactivate();
    }

    private load() {
        // Create empty scene until we have loaded all chipsets
        this.scene = new CommandBuffer([DefaultFBO, ClearAll]);

        // Create a palette for future use.
        let palette = this.surface.createSpriteRenderEl();

        this.chipset_service.getChipsetList()
            .flatMap(chip_list => chip_list)
            .map(chip => this.chipset_service.getChipsetPath(chip))
            .forEach(chip_path => {
                if (!this.chipset) {
                    console.log(`Handle more than one chipset`);
                    return;
                }
                palette.loadSpriteObject(chip_path, builder => {
                    // if (!this.chipset) {
                        this.chipset = builder.buildWithEntireTexture();
                        this.camera.centerOn(this.chipset);
                    // } else {
                        // let chipset = builder.buildWithEntireTexture();
                        // chipset.position();
                    // }
                });
            }).then(() => {
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
                    SpriteProgram,
                    this.camera,
                    palette,
                    this.surface.createSpriteRenderEl().loadSpriteObject(
                        [51, 122, 183, 178],
                        builder => this.brush_area = builder.buildWithSize(16, 16)
                    )
                ]);
            }).catch(err => console.log(`Error while loading chipsets: ${err}`));
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
        if (event.button === 0) {
            let new_id = this.chipset.getTileIdFor(x, y, 16);
            if (new_id != 0) {
                this.brush.replaceWith(1, new_id);
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
