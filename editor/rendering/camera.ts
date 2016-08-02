import {Command, Obj2D} from './interfaces';
import {Context} from './context';
import {ViewportListener} from './viewport';


export class Camera implements Command, ViewportListener {

    // Object space coordinates should map to pixels when
    // the scale factor is 1.
    private zoom_factor = 2.0;

    // Viewport settings
    private viewport_width: number = 1;
    private viewport_height: number = 1;

    // Camera dimensions in object space.
    // Top left corner of the camera in object space
    pos: [number, number] = [0, 0];
    private scaled_pos: [number, number] = [0, 0];
    // width  in object space
    get wos(): number { return 2 * this.viewport_width / this.zoom_factor; }
    // height in object space
    get hos(): number { return 2 * this.viewport_height / this.zoom_factor; }
    // Zoom level
    get zoom_lvl(): number { return this.zoom_factor; }

    translate(x: number, y: number) {
        this.pos[0] -= x;
        this.pos[1] -= y;
        this.updateScaledPos();
    }

    as_camera_with_scale_ignored(): (ctx: Context) => void {

        return (ctx) => {
            ctx.gl.viewport(0, 0, this.viewport_width, this.viewport_height);
            ctx.active_program.setUniforms({
                viewport_size: [
                    this.viewport_width / this.zoom_factor,
                    this.viewport_height / this.zoom_factor
                ],
                view_pos: this.scaled_pos,
            });
        };
    }

    execute(ctx: Context) {
        ctx.gl.viewport(0, 0, this.viewport_width, this.viewport_height);
        ctx.active_program.setUniforms({
            viewport_size: [
                this.viewport_width / this.zoom_factor,
                this.viewport_height / this.zoom_factor
            ],
            view_pos: this.scaled_pos,
            flip_y: ctx.flip_y,
        });
    }

    fromWindowCoordToObjectSpace(mx: number, my: number): [number, number] {
        let z = this.zoom_factor;
        return [
            mx / z + this.scaled_pos[0],
            (this.viewport_height - my) / z + this.scaled_pos[1],
        ];
    }

    centerOn(object: Obj2D): void {
        let w = object.getWidth();
        let h = object.getHeight();
        let z = this.zoom_factor;
        this.pos = [
            w / 2 - this.viewport_width  / (2 * z),
            h / 2 - this.viewport_height / (2 * z)
        ];
        this.updateScaledPos();
    }

    // TODO: Write a test for this function.
    zoom(sign: number, invariant: [number, number] = [0, 0]) {
        let value = Math.sign(sign);
        let old_z = this.zoom_factor;
        let new_z = this.zoom_factor;
        if (value === 1) {
            new_z *= 2;
        } else {
            new_z /= 2;
        }
        if (new_z < 0.5) {
            return;
        }
        if (new_z > 8) {
            return;
        }
        let v = new Float32Array(invariant);
        v[1] = this.viewport_height - v[1];
        this.pos[0] += v[0] / old_z - v[0] / new_z;
        this.pos[1] += v[1] / old_z - v[1] / new_z;
        this.zoom_factor = new_z;
        this.updateScaledPos();
    }

    viewport(width: number, height: number) {
        this.viewport_width = width;
        this.viewport_height = height;
    }

    private updateScaledPos() {
        this.scaled_pos[0] = Math.floor(this.pos[0]);
        this.scaled_pos[1] = Math.floor(this.pos[1]);
    }
}
