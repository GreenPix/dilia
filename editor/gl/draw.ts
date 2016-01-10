import {Program} from './program';
import {VertexBuffer, IndicesBuffer} from './buffer';


export enum Geom {
    POINTS,
    TRIANGLES,
}

export function glDrawBuffers(
    mode: Geom,
    program: Program,
    uniforms: { [uniform_name: string]: any },
    indices: IndicesBuffer, ...buffers: BufferLinkedToProgram[])
{
    // make sure the program is active
    let gl = program.use();
    program.setUniforms(uniforms);

    let count = indices.bufferLength();
    // count = mode === Geom.POINTS ? count: count / 3;
    for (let buffer of buffers) {
        buffer.bindBuffer();
        // // Debug assert:
        // if (buffer.count < count) {
        //     throw new Error('Number of vertices must be superior or equal to number of indices');
        // }
    }
    let m = mode === Geom.POINTS ? gl.POINTS: gl.TRIANGLES;
    indices.bind();
    gl.drawElements(m, count, indices.type(), /* offset in IndicesBuffer */ 0);
}


export class BufferLinkedToProgram {

    bindBuffer: () => void;
    count: number;

    constructor(
        prog: Program,
        buffer: VertexBuffer,
        attr_name: string
    ) {
        let cb = prog.getBindBufferCallback(attr_name);
        this.bindBuffer = () => cb(buffer);
        this.count = buffer.numberOfVertices();
    }
}
