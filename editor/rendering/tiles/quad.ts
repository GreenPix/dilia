import {Program, VertexBuffer, glDrawElements, Geom} from '../../gl/gl';
import {IndicesBuffer, BufferLinkedToProgram} from '../../gl/gl';
import {genQuadI, genQuadData} from '../../gl/gl';
import {Texture} from '../../gl/gl';

import {CameraProperties} from '../interfaces';
import {TilesLayerBuilder, TilesHandle} from './common';
import {ChipsetLayer, TileIdSetter} from './common';
import {SelectedPartialLayer} from './common';
import {SelectedPartialLayerImpl} from './layer';


export class TilesLayer2 implements TilesLayerBuilder, TilesHandle {

    // In tile space the size of those layers
    private width: number = 0;
    private height: number = 0;

    // The size in pixel the size of a tile in object space
    private tile_size: number = 16;

    // The position of this object
    // Changing it force a recalculation of the vertex buffer
    private pos: [number, number] = [0, 0];

    // WebGL state for the Quad
    private vertex_buffer: VertexBuffer | BufferLinkedToProgram;
    private tex_buffer: VertexBuffer | BufferLinkedToProgram;
    private index_buffer: IndicesBuffer;

    // Layers
    private layers: Array<Layer> = [];

    constructor(private gl: WebGLRenderingContext) {
        this.vertex_buffer = new VertexBuffer(gl)
            .numberOfComponents(2)
            .fill(genQuadData(-1, -1, 2, 2));
        this.tex_buffer = new VertexBuffer(gl)
            .numberOfComponents(2)
            .fill(genQuadData(0, 0, 1, 1));
        this.index_buffer = new IndicesBuffer(gl)
            .fill(genQuadI());
    }

    setWidth(w: number): this  { this.width = w; return this; }
    setHeight(h: number): this { this.height = h; return  this; }
    tileSize(ts: number): this { this.tile_size = ts; return this;  }
    position(pos: [number, number]): this { this.pos = pos; return this;  }
    addLayer(layer_per_texture: ChipsetLayer[]): this {
        let l = new Layer(this.gl, this.width, this.tile_size, layer_per_texture);
        this.layers.push(l);
        return this;
    }
    build(): this { return this; }

    /// Draw
    draw(gl: WebGLRenderingContext, program: Program, camera: CameraProperties) {

        // Initialization if not done previously
        if (this.vertex_buffer instanceof VertexBuffer) {
            this.vertex_buffer = new BufferLinkedToProgram(
                program,
                this.vertex_buffer as VertexBuffer,
                'quad_pos'
            );
        }
        if (this.tex_buffer instanceof VertexBuffer) {
            this.tex_buffer = new BufferLinkedToProgram(
                program,
                this.tex_buffer as VertexBuffer,
                'quad_tex'
            );
        }

        // Set common program uniforms
        program.setUniforms({
            tile_size: this.tile_size,
            inverse_map_size: [1.0 / this.width, 1.0 / this.height],
        });

        // Render each layer.
        for (let layer of this.layers) {
            for (let pl of layer.partial_layers) {
                program.setUniforms({
                    tiles_tex: pl.tex.tex_id,
                    tiles_index: pl.ids,
                    inverse_tiles_tex_size: [
                        1.0 / pl.tex.width, 1.0 / pl.tex.height
                    ],
                });
                glDrawElements(Geom.TRIANGLES,
                    gl, this.index_buffer,
                    this.tex_buffer as BufferLinkedToProgram,
                    this.vertex_buffer as BufferLinkedToProgram
                );
            }
        }
    }

    // TilesHandle
    select(layer_index: number, chipset: number): SelectedPartialLayer {
        return new SelectedPartialLayerImpl(
            this.gl,
            this.width,
            this.height,
            this.tile_size,
            this.layers[layer_index].partial_layers[chipset]
        );
    }
    insertEmptyLayer(layer_index: number): void {
        this.layers.splice(layer_index, 0,
            new Layer(this.gl, this.width, this.tile_size, [])
        );
    }
    getPosition(): [number, number] {
        return this.pos;
    }
    getWidth(): number {
        return this.width * this.tile_size;
    }
    getHeight(): number {
        return this.height * this.tile_size;
    }

}

class Layer {
    partial_layers: Array<PartialLayer> = [];

    constructor(
        gl: WebGLRenderingContext,
        width_map: number,
        tile_size: number,
        layer_per_texture: ChipsetLayer[]
    ) {
        for (let cl of layer_per_texture) {
            this.partial_layers.push(
                new PartialLayer(gl, width_map, tile_size, cl)
            );
        }
    }
}

class PartialLayer implements TileIdSetter {

    // Available tiles for that layer
    tex: Texture;
    // Two dimensional tile ids texture
    ids: WebGLTexture;
    // Inner buffer for fast updates
    tile_ids: Uint8Array;

    constructor(
        gl: WebGLRenderingContext,
        width_map: number,
        tile_size: number,
        chipset_layer: ChipsetLayer
    ) {
        this.tex = chipset_layer.chipset;
        this.tile_ids = new Uint8Array(chipset_layer.tiles_id.length * 4);
        this.ids = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.ids);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        let height = chipset_layer.tiles_id.length / width_map;
        let index = 0;
        for (let i = 0; i < width_map; ++i) {
            for (let j = 0; j < height; ++j) {
                this.setTileId(width_map, tile_size, i, j, chipset_layer.tiles_id[index]);
                ++index;
            }
        }
        this.update(gl, width_map, height);
    }

    setTileId(
        width: number,
        tile_size: number,
        i: number,
        j: number,
        tile_id: number
    ): void {
        let index = i * width * 4 + j * 4;
        if (tile_id === 0) {
            this.tile_ids[index + 0] = 255;
            this.tile_ids[index + 1] = 255;
            this.tile_ids[index + 2] = 0;
            this.tile_ids[index + 3] = 0;
        } else {
            let tw = this.tex.width / tile_size;
            let th = this.tex.height / tile_size;
            tile_id = tile_id - 1;
            this.tile_ids[index + 0] = tile_id % tw;
            this.tile_ids[index + 1] = th - Math.floor(tile_id / tw) - 1;
            this.tile_ids[index + 2] = 0;
            this.tile_ids[index + 3] = 0;
        }
    }

    update(gl: WebGLRenderingContext, width: number, height: number): void {
        gl.bindTexture(gl.TEXTURE_2D, this.ids);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0, gl.RGBA,
            width, height,
            0, gl.RGBA,
            gl.UNSIGNED_BYTE, this.tile_ids
        );
    }

}
