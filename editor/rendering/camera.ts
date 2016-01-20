
export class Camera {

    // Values, the actual matrix is the transposed of that one
    private values: Array<number> = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 0
    ];

    // Object space coordinates should map to pixels when
    // the scale factor is 1.
    // TODO: fix that (currently not the case)
    private zoom_factor = 1.0;


    // Top left corner of the camera in object space
    pos: [number, number] = [0, 0];
    // Camera dimensions in object space.
    wos: number = 1; // width  in object space
    hos: number = 1; // height in object space

    translate(x: number, y: number) {
        this.values[7] += x;
        this.values[8] += y;
    }

    zoom(value: number) {
        let f = 1 / this.zoom_factor;
        this.zoom_factor += value;
        this.values[0] *= this.zoom_factor * f;
        this.values[4] *= this.zoom_factor * f;
    }

    viewport(width: number, height: number) {
        this.values[0] = 1 / width;
        this.values[4] = 1 / height;
    }
}
