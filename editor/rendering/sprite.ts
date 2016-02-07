import {glDrawElements, Geom, Texture} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';


/// Sprite builder to customize
/// the way the sprite is being created.
/// This requires first to
export interface SpriteBuilder {
    position(pos: [number, number]): this;
    buildWithEntireTexture(): SpriteHandle;
    overlayFlag(overlay: boolean): this;
    buildFromTileId(tile_size: number, id: number): SpriteHandle;
}

export interface SpriteHandle {
    position(pos: [number, number]): void;
    hide(): void;
    show(): void;
}

export class SpriteObject implements SpriteBuilder, SpriteHandle {

    private tex: Texture;
    private vertex_linked: BufferLinkedToProgram;
    private texCoord_linked: BufferLinkedToProgram;
    private pos: [number, number] = [0, 0];
    private indices: IndicesBuffer;
    private is_overlay: boolean = false;
    private is_hidden: boolean = false;

    constructor(
        private gl: WebGLRenderingContext,
        private program: Program
    ) {
        this.indices = new IndicesBuffer(gl).fill([0, 1, 2, 0, 2, 3]);
    }

    // SpirteHandle interface
    hide(): void {
        this.is_hidden = true;
    }
    show(): void {
        this.is_hidden = false;
    }

    // SpriteBuilder interface
    position(pos: [number, number]): this { this.pos = pos; return this; }
    overlayFlag(overlay: boolean): this   { this.is_overlay = overlay; return this;}
    buildWithEntireTexture(): this {
        let values = [
            -this.tex.width / 2, -this.tex.height / 2,
            -this.tex.width / 2, +this.tex.height / 2,
            +this.tex.width / 2, +this.tex.height / 2,
            +this.tex.width / 2, -this.tex.height / 2,
        ];
        let vec_size = 2;
        let buffer;
        buffer = new VertexBuffer(this.gl)
            .fill(values).numberOfComponents(vec_size);
        this.vertex_linked = new BufferLinkedToProgram(
            this.program, buffer, 'pos');
        buffer = new VertexBuffer(this.gl)
            .fill([0, 0, 0, 1, 1, 1, 1, 0]).numberOfComponents(2);
        this.texCoord_linked = new BufferLinkedToProgram(
            this.program, buffer, 'texCoord');
        return this;
    }
    buildFromTileId(ts: number, id: number): this {
        let values = [
             0,  0,
            ts,  0,
            ts, ts,
             0, ts,
        ];
        let vec_size = 2;
        let buffer;
        id = id - 1;
        buffer = new VertexBuffer(this.gl)
        .fill(values).numberOfComponents(vec_size);
        this.vertex_linked = new BufferLinkedToProgram(
            this.program, buffer, 'pos');
        let w = Math.max(Math.floor(this.tex.width / ts), 1);
        let h = Math.max(Math.floor(this.tex.height / ts), 1);
        let x = id % w;
        let y = id / w;
        buffer = new VertexBuffer(this.gl)
        .fill([
                  x / w, y / h,
            (x + 1) / w, y / h,
            (x + 1) / w, (y + 1) / h,
                  x / w, (y + 1) / h
        ]).numberOfComponents(2);
        this.texCoord_linked = new BufferLinkedToProgram(
            this.program, buffer, 'texCoord');
        return this;
    }

    initWith(tex: Texture) {
        this.tex = tex;
    }

    draw(gl: WebGLRenderingContext, program: Program) {
        // Don't draw if this sprite is hidden.
        if (this.is_hidden) return;

        program.setUniforms({
            texture: this.tex.tex_id,
            obj_pos: this.pos,
            is_overlay: this.is_overlay
        });
        glDrawElements(
            Geom.TRIANGLES,
            gl,
            this.indices,
            this.vertex_linked, this.texCoord_linked);
    }
}
