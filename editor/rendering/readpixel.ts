import {Subject} from 'rxjs/Subject';
import {Context} from './context';
import {Command} from './interfaces';


export class ReadPixel implements Command {

    stream = new Subject<Uint8Array>();

    constructor(
        private width: number,
        private height: number
    ) {}

    execute(ctx: Context) {
        let w = this.width;
        let h = this.height;
        let pixels = new Uint8Array(w * h * 4);
        ctx.gl.readPixels(0, 0, w, h, ctx.gl.RGBA, ctx.gl.UNSIGNED_BYTE, pixels);
        this.stream.next(pixels);
    }
}
