import {Command, Obj2D} from './interfaces';
import {Context} from './context';
import {ViewportListener} from './viewport';

export const FixedCamera = (width: number, height: number) => {
    // TODO: Figure out the reason behind
    //       the inversion of the y axis.
    //       This is surprising as in OpenGL
    //       the y axis point up
    const identity_values = new Float32Array([
        2 / width, 0,  0,
        0, -2 / height, 0,
        -1, 1, 0,
    ]);
    return (ctx: Context) => {
        ctx.gl.viewport(0, 0, width, height);
        ctx.active_camera = identity_values;
        // TODO: Fix this (buggy)
        ctx.active_camera_props = {
            pos: [0, 0],
            wos: 0,
            hos: 0,
        };
    };
};

export class Camera implements Command, ViewportListener {

    // Values, the actual matrix is the transposed of that one
    private values: Float32Array = new Float32Array([
        4, 0, 0,
        0, 4, 0,
        0, 0, 0
    ]);

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
        this.values[6] += x * this.values[0];
        this.values[7] += y * this.values[4];
        this.pos[0] += x;
        this.pos[1] += y;
        this.updateSaledPos();
    }

    as_camera_with_scale_ignored(): (ctx: Context) => void {

        return (ctx) => {
            ctx.gl.viewport(0, 0, this.viewport_width, this.viewport_height);
            let values = new Float32Array(this.values);
            values[0] = 2 / this.viewport_width;
            values[4] = 2 / this.viewport_height;
            ctx.active_camera = values;
            ctx.active_program.setUniforms({
                proj: values
            });
            ctx.active_camera_props = this;
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
            proj: this.values,
        });
        ctx.active_camera = this.values;
        ctx.active_camera_props = this;
    }

    fromWindowCoordToObjectSpace(mx: number, my: number): [number, number] {
        let a = 1 / this.values[0];
        let b = 1 / this.values[4];
        let c = this.values[6];
        let d = this.values[7];
        return [
            a * (2 * mx / this.viewport_width - 1) - c * a,
            b * (1 - 2 * my / this.viewport_height) - d * b
        ];
    }

    centerOn(object: Obj2D): void {
        let [x, y] = object.getPosition();
        let w = object.getWidth();
        let h = object.getHeight();
        this.pos = [-x -w / 2, -y -h / 2];
        this.values[6] = Math.floor(this.pos[0]) * this.values[0];
        this.values[7] = Math.floor(this.pos[1]) * this.values[4];
        this.updateSaledPos();
    }

    // TODO: Write a test for this function.
    zoom(sign: number, invariant: [number, number] = [0, 0]) {
        let value = Math.sign(sign);
        let old_z = this.zoom_factor;
        if (value === 1) {
            this.zoom_factor *= 2;
        } else {
            this.zoom_factor /= 2;
        }
        if (this.zoom_factor < 0.5) {
            this.zoom_factor = 0.5;
            return;
        }
        if (this.zoom_factor > 8) {
            this.zoom_factor = 8;
            return;
        }

        this.translate(
            invariant[0] / old_z * (old_z - this.zoom_factor),
            invariant[1] / old_z * (old_z - this.zoom_factor)
        );

        this.updateScaleValues(old_z);
    }

    viewport(width: number, height: number) {
        this.viewport_width = width;
        this.viewport_height = height;
        let o0 = this.values[0];
        let o4 = this.values[4];
        this.updateScaleValues();
        this.values[6] *= this.values[0] / o0;
        this.values[7] *= this.values[4] / o4;
    }

    private updateScaleValues(old_z?: number) {
        this.values[0] = this.zoom_factor * 2.0 / this.viewport_width; // old_z;
        this.values[4] = this.zoom_factor * 2.0 / this.viewport_height; // old_z;
    }

    private updateSaledPos() {
        this.scaled_pos[0] = Math.floor(this.pos[0] / this.zoom_factor) * this.zoom_factor;
        this.scaled_pos[1] = Math.floor(this.pos[1] / this.zoom_factor) * this.zoom_factor;
    }
}
