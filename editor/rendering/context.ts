import {Program} from '../gl/gl';


export class Context {
    active_program: Program = undefined;
    flip_y: boolean = false;
    constructor(
        public gl: WebGLRenderingContext
    ) {}
}
