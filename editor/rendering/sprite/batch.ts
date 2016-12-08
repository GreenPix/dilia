import {Program, VertexBuffer} from '../../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../../gl/gl';
import {glDrawElements, Geom, Texture} from '../../gl/gl';
import {genQuadI, genQuadData} from '../../gl/gl';


export interface SpriteBatchBuilder {
    addSprite(
        posx: number,
        posy: number,
        boxwidth: number,
        boxheight: number,
        texu: number,
        texv: number,
        texwidth: number,
        texheight: number
    ): number;
    build(): void;
}

export class SpriteBatchObject {

    tex: Texture;
    private pos: Float32Array;
    private texCoord: Float32Array;
    private vertex_linked: BufferLinkedToProgram | VertexBuffer;
    private texCoord_linked: BufferLinkedToProgram | VertexBuffer;
    private indices: IndicesBuffer | undefined;

    constructor(
        private gl: WebGLRenderingContext
    ) {}

    makeBuilder(nb_sprites: number): SpriteBatchBuilder {
        return new SpriteBatchBuilderImpl(
            this.pos,
            this.texCoord,
            this,
            nb_sprites
        );
    }

    buildFromBatch(indices: Uint16Array): void {
        this.vertex_linked = new VertexBuffer(this.gl)
            .fillTyped(this.pos).numberOfComponents(2);
        this.texCoord_linked = new VertexBuffer(this.gl)
            .fillTyped(this.texCoord).numberOfComponents(2);
        this.indices = new IndicesBuffer(this.gl)
            .fillTyped(indices);
    }

    draw(gl: WebGLRenderingContext, program: Program) {
        if (!this.indices) return;

        if (this.vertex_linked instanceof VertexBuffer &&
            this.texCoord_linked instanceof VertexBuffer) {
            this.vertex_linked = new BufferLinkedToProgram(
                program, this.vertex_linked, 'pos'
            );
            this.texCoord_linked = new BufferLinkedToProgram(
                program, this.texCoord_linked, 'tex'
            );
        }

        program.setUniforms({
            texture: this.tex.tex_id
        });
        glDrawElements(
            Geom.TRIANGLES,
            gl,
            this.indices,
            this.vertex_linked as BufferLinkedToProgram,
            this.texCoord_linked as BufferLinkedToProgram
        );
    }
}

class SpriteBatchBuilderImpl implements SpriteBatchBuilder {

    private last_index = 0;

    constructor(
        private pos: Float32Array,
        private texCoord: Float32Array,
        private batch: SpriteBatchObject,
        private nb_sprites: number
    ) {
        this.pos = new Float32Array(nb_sprites * 4);
        this.texCoord = new Float32Array(nb_sprites * 4);
    }

    addSprite(
        posx: number,
        posy: number,
        boxwidth: number,
        boxheight: number,
        texu: number,
        texv: number,
        texwidth: number,
        texheight: number
    ): number {
        let vertices = genQuadData(posx, posy, boxwidth, boxheight);
        let texcoords = genQuadData(texu, texv, texwidth, texheight);
        this.pos[this.last_index * 4 + 0] = vertices[0];
        this.pos[this.last_index * 4 + 1] = vertices[1];
        this.pos[this.last_index * 4 + 2] = vertices[2];
        this.pos[this.last_index * 4 + 3] = vertices[3];
        this.texCoord[this.last_index * 4 + 0] = texcoords[0];
        this.texCoord[this.last_index * 4 + 1] = texcoords[1];
        this.texCoord[this.last_index * 4 + 2] = texcoords[2];
        this.texCoord[this.last_index * 4 + 3] = texcoords[3];
        return ++this.last_index;
    }

    build(): void {
        let quadindices = genQuadI();
        let indices = new Uint16Array(this.nb_sprites * 6);
        for (let i = 0; i < indices.length; i += 6) {
            indices[i] = quadindices[i % 6] + Math.floor(i / 6) * 6;
        }
        this.batch.buildFromBatch(indices);
    }
}
