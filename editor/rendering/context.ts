import {Program} from '../gl/gl';


export class Context {
    active_program: Program;
    flip_y: boolean = false;
    constructor(
        public gl: WebGLRenderingContext
    ) {
        this.active_program = new Program(gl);
    }
}
