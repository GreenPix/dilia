import {glDrawElements, Geom, Texture} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';
import {Obj2D} from './camera';


/// Sprite builder to customize
/// the way the sprite is being created.
/// This requires first to
export interface SpriteBuilder {
    position(pos: [number, number]): this;
    overlayFlag(overlay: boolean): this;
    buildWithEntireTexture(): SpriteHandle;
    buildWithSize(width: number, height: number): SpriteHandle;
    buildFromTileId(tile_size: number, id: number): SpriteHandle;
}

export interface SpriteHandle extends Obj2D {
    hide(): void;
    show(): void;
    getTileIdFor(x: number, y: number, tile_size: number): number;
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
    getWidth(): number {
        return this.tex.width;
    }
    getHeight(): number {
        return this.tex.height;
    }
    getPosition(): [number, number] {
        return this.pos;
    }
    getTileIdFor(x: number, y: number, tile_size: number): number {
        let i, j, w, h;
        i = Math.floor(y / tile_size);
        j = Math.floor(x / tile_size);
        w = this.tex.width / tile_size;
        h = this.tex.height / tile_size;
        if (i >= 0 && i < h && j >= 0 && j < w) {
            return i * w + j + 1;
        }
        return 0;
    }

    // SpriteBuilder interface
    position(pos: [number, number]): this { this.pos = pos; return this; }
    overlayFlag(overlay: boolean): this   { this.is_overlay = overlay; return this;}
    buildWithEntireTexture(): this {
        return this.buildFrom([
            0, 0,
            this.tex.width, 0,
            this.tex.width, this.tex.height,
            0, this.tex.height
        ], [0, 0, 1, 0, 1, 1, 0, 1]);
    }
    buildWithSize(width: number, height: number): this {
        return this.buildFrom([
            0, 0,
            width, 0,
            width, height,
            0, height
        ], [0, 0, 1, 0, 1, 1, 0, 1]);
    }
    buildFromTileId(ts: number, id: number): this {
        id = id - 1;
        let w = Math.max(Math.floor(this.tex.width / ts), 1);
        let h = Math.max(Math.floor(this.tex.height / ts), 1);
        let x = id % w;
        let y = Math.floor(id / w);
        return this.buildFrom([
                0,  0,
               ts,  0,
               ts, ts,
                0, ts,],
            [     x / w, y / h,
            (x + 1) / w, y / h,
            (x + 1) / w, (y + 1) / h,
                  x / w, (y + 1) / h
        ]);
    }
    private buildFrom(pos: number[], texCoord: number[]): this {
        let buffer = new VertexBuffer(this.gl)
            .fill(pos).numberOfComponents(2);
        this.vertex_linked = new BufferLinkedToProgram(
            this.program, buffer, 'pos');
        buffer = new VertexBuffer(this.gl)
            .fill(texCoord).numberOfComponents(2);
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
