import {Program, VertexBuffer, texRepeat, Pixels} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';
import {glDrawElements, Geom, Texture} from '../gl/gl';
import {updateTextureFromPixels} from '../gl/gl';
import {genQuadI, genQuadData} from '../gl/gl';
import {Obj2D} from './interfaces';


/// Sprite builder to customize
/// the way the sprite is being created.
/// This requires first to
export interface SpriteBuilder {
    position(pos: [number, number]): this;
    overlayFlag(overlay: boolean): this;
    updateTexture(pixels: Pixels): this;
    buildWithEntireTexture(): SpriteHandle;
    buildWithSize(width: number, height: number, tex_repeat?: boolean): SpriteHandle;
    buildFromTileId(tile_size: number, id: number): SpriteHandle;
}

export interface SpriteHandle extends Obj2D {
    hide(): void;
    show(): void;
    getTileIdFor(x: number, y: number, tile_size: number): number;
}

export class SpriteObject implements SpriteBuilder, SpriteHandle {

    tex: Texture;
    private vertex_linked: BufferLinkedToProgram | VertexBuffer;
    private texCoord_linked: BufferLinkedToProgram | VertexBuffer;
    private pos: [number, number] = [0, 0];
    private indices: IndicesBuffer;
    private is_overlay: boolean = false;
    private is_hidden: boolean = false;

    constructor(
        private gl: WebGLRenderingContext
    ) {
        this.indices = new IndicesBuffer(gl).fill(genQuadI());
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
        return this.buildFrom(
            genQuadData(0, 0, this.tex.width, this.tex.height),
            genQuadData(0, 0, 1, 1));
    }
    updateTexture(pixels: Pixels): this {
        updateTextureFromPixels(this.gl, this.tex, pixels);
        return this;
    }
    buildWithSize(width: number, height: number, tex_repeat?: boolean): this {
        let tex_coord_w, tex_coord_h;
        if (tex_repeat) {
            texRepeat(this.gl, this.tex.tex_id);
            tex_coord_w = width / this.tex.width;
            tex_coord_h = height / this.tex.height;
        } else {
            tex_coord_w = 1;
            tex_coord_h = 1;
        }
        return this.buildFrom(
            genQuadData(0, 0, width, height),
            genQuadData(0, 0, tex_coord_w, tex_coord_h));
    }
    buildFromTileId(ts: number, id: number): this {
        id = id - 1;
        let w = Math.max(Math.floor(this.tex.width / ts), 1);
        let h = Math.max(Math.floor(this.tex.height / ts), 1);
        let x = id % w;
        let y = Math.floor(id / w);
        return this.buildFrom(
            genQuadData(0,  0, ts, ts),
            genQuadData(x / w, y / h, 1 / w, 1 / h));
    }
    private buildFrom(pos: number[], texCoord: number[]): this {
        let buffer = new VertexBuffer(this.gl)
            .fill(pos).numberOfComponents(2);
        this.vertex_linked = buffer;
        buffer = new VertexBuffer(this.gl)
            .fill(texCoord).numberOfComponents(2);
        this.texCoord_linked = buffer;
        return this;
    }

    initWith(tex: Texture) {
        this.tex = tex;
    }

    draw(gl: WebGLRenderingContext, program: Program) {
        // Don't draw if this sprite is hidden.
        if (this.is_hidden) return;

        if (this.vertex_linked instanceof VertexBuffer &&
            this.texCoord_linked instanceof VertexBuffer) {
            this.vertex_linked = new BufferLinkedToProgram(
                program, this.vertex_linked as VertexBuffer, 'pos');
            this.texCoord_linked = new BufferLinkedToProgram(
                program, this.texCoord_linked as VertexBuffer, 'texCoord');
        }

        program.setUniforms({
            texture: this.tex.tex_id,
            obj_pos: this.pos,
            is_overlay: this.is_overlay
        });
        glDrawElements(
            Geom.TRIANGLES,
            gl,
            this.indices,
            this.vertex_linked as BufferLinkedToProgram,
            this.texCoord_linked as BufferLinkedToProgram);
    }
}
