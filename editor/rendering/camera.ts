import {Program} from '../gl/gl';

export interface Obj2D {
    // Set the new position
    position(pos: [number, number]): void;
    // Returns the width of this object.
    getWidth(): number;
    // Returns the height of this object.
    getHeight(): number;
    // Returns the position of this object.
    getPosition(): [number, number];
}

export class Camera {

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
    // width  in object space
    get wos(): number { return 2 * this.viewport_width / this.zoom_factor; }
    // height in object space
    get hos(): number { return 2 * this.viewport_height / this.zoom_factor; }

    translate(x: number, y: number) {
        this.values[6] += x * this.values[0];
        this.values[7] += y * this.values[4];
        this.pos[0] += x;
        this.pos[1] += y;
    }

    applyFor(program: Program) {
        program.setUniforms({
            proj: this.values
        });
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
        this.values[6] = this.pos[0] * this.values[0];
        this.values[7] = this.pos[1] * this.values[4];
    }

    // TODO: Write a test for this function.
    zoom(sign: number, invariant: [number, number] = [0, 0]) {
        let value = Math.sign(sign);
        let old_z = this.zoom_factor;
        if (Math.abs(this.zoom_factor - 1) <= 0.1) {
            if (value === -1) {
                this.zoom_factor = 0.5;
            } else {
                this.zoom_factor += 1;
            }
        } else if (Math.abs(this.zoom_factor - 0.5) <= 0.1) {
            if (value === 1) {
                this.zoom_factor = 1;
            } else {
                return;
            }
        } else if (this.zoom_factor < 5) {
            this.zoom_factor += value;
        } else if (this.zoom_factor < 10) {
            this.zoom_factor += 2 * value;
        } else if (this.zoom_factor >= 10 && value === -1) {
            this.zoom_factor -= 2;
        } else {
            return;
        }

        this.translate(
            invariant[0] / old_z * (old_z - this.zoom_factor),
            invariant[1] / old_z * (old_z - this.zoom_factor)
        );

        this.values[0] *= this.zoom_factor / old_z;
        this.values[4] *= this.zoom_factor / old_z;
    }

    viewport(width: number, height: number) {
        this.viewport_width = width;
        this.viewport_height = height;
        let o0 = this.values[0];
        let o4 = this.values[4];
        this.values[0] = 2 * this.zoom_factor / width;
        this.values[4] = 2 * this.zoom_factor / height;
        this.values[6] *= this.values[0] / o0;
        this.values[7] *= this.values[4] / o4;
    }
}
