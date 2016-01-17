
export class Camera {

    // Values, the actual matrix is the transposed of that one
    private values: Array<number> = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 0
    ];
    private zoom_factor = 1.0;

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
