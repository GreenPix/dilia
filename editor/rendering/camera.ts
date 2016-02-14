
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


    // Top left corner of the camera in object space
    pos: [number, number] = [0, 0];
    // Camera dimensions in object space.
    wos: number = 1; // width  in object space
    hos: number = 1; // height in object space

    translate(x: number, y: number) {
        this.values[6] += x;
        this.values[7] += y;
    }

    fromWindowCoordToObjectSpace(x: number, y: number): [number, number] {
        return [
            - this.pos[0] - 0.5 * this.wos + x / this.zoom_factor,
            - this.pos[1] + 0.5 * this.hos - y / this.zoom_factor
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
    zoom(sign: number) {
        let value = Math.sign(sign);
        let f = 1 / this.zoom_factor;
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

        this.values[0] *= this.zoom_factor * f;
        this.values[4] *= this.zoom_factor * f;
        this.wos /= this.zoom_factor * f;
        this.hos /= this.zoom_factor * f;
    }

    viewport(width: number, height: number) {
        this.wos = width / this.zoom_factor;
        this.hos = height / this.zoom_factor;
        let o0 = this.values[0];
        let o4 = this.values[4];
        this.values[0] = 2 * this.zoom_factor / width;
        this.values[4] = 2 * this.zoom_factor / height;
        this.values[6] *= this.values[0] / o0;
        this.values[7] *= this.values[4] / o4;
    }
}
