import {Pixels} from '../gl/tex';


export function genPixelsForTextureWithBorder(ts: number): Pixels {
    let res = new Pixels();
    res.width = ts;
    res.raw = new Uint32Array(ts * ts);

    let inner  = new Uint32Array((new Uint8Array([ 51, 51, 51, 200]).buffer));
    let border = new Uint32Array((new Uint8Array([119,119,119, 200]).buffer));

    res.raw.fill(inner[0]);

    // res.raw[i]

    for (let i = 1; i < ts; i += 4) {
        res.raw[i +  0] = border[0];
        // res.raw[i + ts] = border[0];

        // res.raw[i + ts * ts - 2 * ts] = border[0];
        res.raw[i + ts * ts - 1 * ts] = border[0];

        res.raw[i * ts + 0] = border[0];
        // res.raw[i * ts + 1] = border[0];

        // res.raw[i * ts + ts - 2] = border[0];
        res.raw[i * ts + ts - 1] = border[0];

        res.raw[i +  1] = border[0];
        res.raw[i + 1 + ts * ts - 1 * ts] = border[0];
        res.raw[(i + 1) * ts + 0] = border[0];
        res.raw[(i + 1) * ts + ts - 1] = border[0];
    }

    return res;
}
