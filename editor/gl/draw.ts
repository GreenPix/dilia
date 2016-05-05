import {Program} from './program';
import {VertexBuffer, IndicesBuffer} from './buffer';


export enum Geom {
    POINTS,
    TRIANGLES,
}

export function glDrawElements(
    mode: Geom,
    gl: WebGLRenderingContext,
    indices: IndicesBuffer, ...buffers: BufferLinkedToProgram[])
{
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

export function glDrawBuffers(
    mode: Geom,
    gl: WebGLRenderingContext,
    ...buffers: BufferLinkedToProgram[])
{
    let m = mode === Geom.POINTS ? gl.POINTS: gl.TRIANGLES;
    let count = 0;

    for (let buffer of buffers) {
        buffer.bindBuffer();
        if (count == 0) {
            count = buffer.count;
        } else {
            count = Math.min(count, buffer.count);
        }
    }

    gl.drawArrays(m, 0, count);
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
        if (!IS_PRODUCTION) {
            if (cb === undefined) {
                throw new Error(`Debug: The program does not use '${attr_name}'`);
            }
        }
        this.bindBuffer = () => cb(buffer);
        this.count = buffer.numberOfVertices();
    }
}
