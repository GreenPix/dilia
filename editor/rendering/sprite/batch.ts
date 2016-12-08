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
    private positions: Float32Array = new Float32Array(0);
    private texCoord: Float32Array;
    private vertex_linked: BufferLinkedToProgram | VertexBuffer;
    private texCoord_linked: BufferLinkedToProgram | VertexBuffer;
    private indices: IndicesBuffer | undefined;

    constructor(
        private gl: WebGLRenderingContext
    ) {}

    makeBuilder(nb_sprites: number): SpriteBatchBuilder {
        this.positions = new Float32Array(nb_sprites * Quad.NC);
        this.texCoord = new Float32Array(nb_sprites * Quad.NC);
        return new SpriteBatchBuilderImpl(
            this.positions,
            this.texCoord,
            this,
            nb_sprites
        );
    }

    setPos(sprite: number, x: number, y: number) {
        let boxwidth = this.positions[sprite * Quad.NC + 2] - this.positions[sprite * Quad.NC + 0];
        let boxheight = this.positions[sprite * Quad.NC + 5] - this.positions[sprite * Quad.NC + 3];
        let vertices = genQuadData(x, y, boxwidth, boxheight);
        this.positions[sprite * Quad.NC + 0] = vertices[0];
        this.positions[sprite * Quad.NC + 1] = vertices[1];
        this.positions[sprite * Quad.NC + 2] = vertices[2];
        this.positions[sprite * Quad.NC + 3] = vertices[3];
        this.positions[sprite * Quad.NC + 4] = vertices[4];
        this.positions[sprite * Quad.NC + 5] = vertices[5];
        this.positions[sprite * Quad.NC + 6] = vertices[6];
        this.positions[sprite * Quad.NC + 7] = vertices[7];
    }

    updatePositions(): void {
        this.vertex_linked = new VertexBuffer(this.gl)
            .fillTyped(this.positions).numberOfComponents(Quad.C);
    }

    buildFromBatch(indices: Uint16Array): void {
        this.vertex_linked = new VertexBuffer(this.gl)
            .fillTyped(this.positions).numberOfComponents(Quad.C);
        this.texCoord_linked = new VertexBuffer(this.gl)
            .fillTyped(this.texCoord).numberOfComponents(Quad.C);
        this.indices = new IndicesBuffer(this.gl)
            .fillTyped(indices);
    }

    draw(gl: WebGLRenderingContext, program: Program) {
        if (!this.indices) return;

        if (this.vertex_linked instanceof VertexBuffer) {
            this.vertex_linked = new BufferLinkedToProgram(
                program, this.vertex_linked, 'pos'
            );
        }

        if (this.texCoord_linked instanceof VertexBuffer) {
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
            this.vertex_linked,
            this.texCoord_linked
        );
    }
}

const enum Quad {
    N = 4,
    I = 6,
    C = 2,
    NC = 8, // Quad.C * Quad.N
}

class SpriteBatchBuilderImpl implements SpriteBatchBuilder {

    private last_index = 0;

    constructor(
        private pos: Float32Array,
        private texCoord: Float32Array,
        private batch: SpriteBatchObject,
        private nb_sprites: number
    ) {}

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
        this.pos[this.last_index * Quad.NC + 0] = vertices[0];
        this.pos[this.last_index * Quad.NC + 1] = vertices[1];
        this.pos[this.last_index * Quad.NC + 2] = vertices[2];
        this.pos[this.last_index * Quad.NC + 3] = vertices[3];
        this.pos[this.last_index * Quad.NC + 4] = vertices[4];
        this.pos[this.last_index * Quad.NC + 5] = vertices[5];
        this.pos[this.last_index * Quad.NC + 6] = vertices[6];
        this.pos[this.last_index * Quad.NC + 7] = vertices[7];
        this.texCoord[this.last_index * Quad.NC + 0] = texcoords[0];
        this.texCoord[this.last_index * Quad.NC + 1] = texcoords[1];
        this.texCoord[this.last_index * Quad.NC + 2] = texcoords[2];
        this.texCoord[this.last_index * Quad.NC + 3] = texcoords[3];
        this.texCoord[this.last_index * Quad.NC + 4] = texcoords[4];
        this.texCoord[this.last_index * Quad.NC + 5] = texcoords[5];
        this.texCoord[this.last_index * Quad.NC + 6] = texcoords[6];
        this.texCoord[this.last_index * Quad.NC + 7] = texcoords[7];
        return ++this.last_index;
    }

    build(): void {
        let quadi = genQuadI();
        let indices = new Uint16Array(this.nb_sprites * Quad.I);
        for (let i = 0; i < indices.length; i++) {
            indices[i] = quadi[i % Quad.I] + Math.floor(i / Quad.I) * Quad.N;
        }
        this.batch.buildFromBatch(indices);
    }
}
