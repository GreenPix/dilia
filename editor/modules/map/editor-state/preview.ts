import {Subject} from 'rxjs/Subject';
import {WebGLSurface} from '../../../components';
import {Pipeline} from '../../../rendering/interfaces';

export class OneFrameSaveSwapBack implements Pipeline {

    constructor(
        private swap_to_scene: Pipeline,
        private oneframe_scene: Pipeline,
        private surface: WebGLSurface,
        private emitter: Subject<string>
    ) {}

    render(gl: WebGLRenderingContext) {
        // TODO: use a different canvas that is not visible and with
        // the proper size. OR
        // Reduce the size of the current canvas...
        console.time('preview');
        console.time('preview-resize');
        let prev_height = gl.canvas.height;
        let prev_width = gl.canvas.width;
        gl.canvas.width = 256;
        gl.canvas.height = 256;
        this.oneframe_scene.render(gl);
        let dataurl = gl.canvas.toDataURL('image/png');
        // Go back to original:
        gl.canvas.width = prev_width;
        gl.canvas.height = prev_height;
        console.timeEnd('preview-resize');
        this.swap_to_scene.render(gl);
        console.timeEnd('preview');
        this.emitter.next(dataurl.slice(22));
        this.surface.setActivePipeline(this.swap_to_scene);
    }
}
