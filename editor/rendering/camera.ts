
export class Camera {

    // Values, the actual matrix is the transposed of that one
    private values: Array<number> = [
        2, 0, 0,
        0, 2, 0,
        0, 0, 0
    ];

    // Object space coordinates should map to pixels when
    // the scale factor is 1.
    // TODO: fix that (currently not the case)
    private zoom_factor = 2.0;


    // Top left corner of the camera in object space
    pos: [number, number] = [0, 0];
    // Camera dimensions in object space.
    wos: number = 1; // width  in object space
    hos: number = 1; // height in object space

    translate(x: number, y: number) {
        this.values[7] += x;
        this.values[8] += y;
    }

    fromWindowCoordToObjectSpace(x: number, y: number): [number, number] {
        return [
            this.pos[0] - 0.5 * this.wos + x / this.zoom_factor,
            this.pos[1] + 0.5 * this.hos - y / this.zoom_factor
        ];
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
        this.values[0] = this.zoom_factor / width;
        this.values[4] = this.zoom_factor / height;
    }
}
