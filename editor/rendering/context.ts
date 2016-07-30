import {Program} from '../gl/gl';


export class Context {
    active_program: Program = undefined;
    active_camera: Float32Array = undefined;
    flip_y: boolean = false;
    constructor(
        public gl: WebGLRenderingContext
    ) {}
}
