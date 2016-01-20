import {TextureLoader, glDrawBuffers, Geom} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';

export class TexObject {

    private buffer_pos: BufferLinkedToProgram;
    private buffer_texCoord: BufferLinkedToProgram;
    private indices: IndicesBuffer;
    private tex_id: WebGLTexture;

    constructor(
        gl: WebGLRenderingContext,
        program: Program,
        tex_loader: TextureLoader,
        path: string
    ) {
        tex_loader.loadTexture(path, tex => {
            this.tex_id = tex.tex_id;
            let values = [
                -tex.width / 2, -tex.height / 2,
                -tex.width / 2, +tex.height / 2,
                +tex.width / 2, +tex.height / 2,
                +tex.width / 2, -tex.height / 2,
            ];
            let vec_size = 2;
            let buffer;
            buffer = new VertexBuffer(gl)
                .fill(values).numberOfComponents(vec_size);
            this.buffer_pos = new BufferLinkedToProgram(program, buffer, 'pos');
            buffer = new VertexBuffer(gl)
                .fill([0, 0, 0, 1, 1, 1, 1, 0]).numberOfComponents(2);
            this.buffer_texCoord = new BufferLinkedToProgram(program, buffer, 'texCoord');
            this.indices = new IndicesBuffer(gl).fill([0, 1, 2, 0, 2, 3]);
        });
    }

    draw(gl: WebGLRenderingContext, uniforms_values) {
        glDrawBuffers(
            Geom.TRIANGLES,
            gl,
            uniforms_values,
            this.indices, this.buffer_pos, this.buffer_texCoord);
    }
}
