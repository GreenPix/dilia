import {VertexArrayObject} from './vao';
import {Program} from './program';

export class Context {
    constructor(
        private gl: WebGLRenderingContext
    ) {}

    use(program: Program) {

    }

    draw(...vao: VertexArrayObject[]) {

    }
}
