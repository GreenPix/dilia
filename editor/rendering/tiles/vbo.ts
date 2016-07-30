import {Program, VertexBuffer, glDrawElements, Geom} from '../../gl/gl';
import {IndicesBuffer, BufferLinkedToProgram} from '../../gl/gl';
import {ChipsetLayer, TilesLayerBuilder, TilesHandle, SelectedPartialLayer} from './common';
import {SelectedPartialLayerImpl} from './layer';


// A note on how the rendering works:
//
// We perform the rendering for tiles as follow
// - We have a total of nb_tiles = width * height
// - We group tiles per chipset
//
//      - A render call consist of:
//        a chipset
//        a shared indices buffer           nb_tiles * 6 (square)
//        a unique list of tiles            nb_tiles
//        a shared tile vertex buffer       nb_tiles * 4
//        (the texture coordinates are computed in the shader)
//
//        Here the tile vertex buffer is shared with all the
//        layers.
//
//   OR
//      - A render call could be:
//        a chipset
//        a unique indices buffer       nb_tiles_using_chipset * 6
//        a unique vertex buffer        nb_tiles_using_chipset * 4
//        a unique list of tiles        nb_tiles_using_chipset
//
//        The vertex buffer is reduced to only the part that are visible.
//        Same for the list of tiles.
//
//        However nothing is shared, so more memory is used.
//
// - When the camera change we update the vertex buffers to only render
//   what's visible plus some extent.
//


/// Model defining an array of layers of tiles
/// This class is supposed to be used to create a layer that
/// has a great number of tiles.
/// The model is also assumed to be static, so some
/// computations are assumed to take place less often than others.
/// As a reference, if the number of tiles that fit within the camera
/// is less than the number of tiles your layer contains, then this
/// is probably not the abstraction you are looking for.
export class TilesLayer implements TilesLayerBuilder, TilesHandle {

    // In tile space the size of those layers
    private width: number = 0;
    private height: number = 0;

    // The size in pixel the size of a tile in object space
    private tile_size: number = 16;

    // The position of this object
    // Changing it force a recalculation of the vertex buffer
    private pos: [number, number] = [0, 0];

    // Static layers: Full Layer Content
    private static_layers: Array<Layer> = [];

    // Dynamic content updated when camera change
    // This is a view in the previous objects.
    private dynamic_layers: Array<Layer> = [];

    private vertex_buffer: VertexBuffer;
    private vertex_linked: BufferLinkedToProgram;
    private index_buffer: IndicesBuffer;

    // Previously stored camera position and bounds in tile space:
    private old_cam_ij: [number, number] = [0, 0];
    private old_cam_hw: [number, number] = [0, 0];
    private is_dirty: boolean = true;

    constructor(private gl: WebGLRenderingContext) {
        this.vertex_buffer = new VertexBuffer(gl).numberOfComponents(2);
        this.index_buffer = new IndicesBuffer(gl);
        this.vertex_linked = undefined;
    }

    getTextures(): Array<WebGLTexture> {
        let texs = new Array();
        for (let sl of this.static_layers) {
            for (let pl of sl.partial_layers) {
                if (texs.indexOf(pl.texture) === -1) {
                    texs.push(pl.texture);
                }
            }
        }
        return texs;
    }

    // TilesLayerBuilder interface
    setWidth(w: number): this { this.width = w; return this; }
    setHeight(h: number): this { this.height = h; return this; }
    tileSize(ts: number): this { this.tile_size = ts; return this;  }
    position(pos: [number, number]): this { this.pos = pos; return this;  }
    addLayer(layer_per_texture: ChipsetLayer[]): this {
        let l = Layer.createFromRawData(this.tile_size, layer_per_texture);
        this.static_layers.push(l);
        return this;
    }
    build(): this { return this; }


    // TilesHandle
    select(layer_index: number, chipset: number): SelectedPartialLayer {
        return this.static_layers[layer_index]
            .select(this.gl, this.width, this.height, this.tile_size, chipset,
                () => this.is_dirty = true
            );
    }
    insertEmptyLayer(layer_index: number): void {
        this.static_layers.splice(layer_index, 0,
            Layer.createFromRawData(this.tile_size, [])
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

    /// Draw operation only used by a rendering context.
    draw(gl: WebGLRenderingContext, program: Program, camera: CameraProperties) {

        // Init dynamic_layers if needed
        this.initDynamicLayers(gl);

        // Update content of buffers if needed
        this.updateBuffers(camera);

        if (!this.vertex_linked) {
            this.vertex_linked = new BufferLinkedToProgram(
                program,
                this.vertex_buffer,
                'tile_pos'
            );
        }

        for (let layer of this.dynamic_layers) {
            layer.draw(gl, program, this.vertex_linked, this.index_buffer);
        }
    }

    private initDynamicLayers(gl: WebGLRenderingContext) {
        if (this.dynamic_layers.length === 0) {
            for (let sl of this.static_layers) {
                this.dynamic_layers.push(
                    Layer.createForRendering(gl, sl)
                );
            }
        }
    }

    private updateBuffers(camera: CameraProperties) {

        // Check if the update is needed or not.
        let new_ij: [number, number] = [0, 0];
        let new_hw: [number, number] = [0, 0];

        // let f = CFP * this.tile_size;
        //
        // let diff: [number, number] = [
        //     camera.pos[0] - this.pos[0],
        //     camera.pos[1] - this.pos[1]
        // ];
        //
        // Compute the new position of the camera in tile space
        // new_ij[0] = Math.min(
        //     Math.max(Math.ceil(diff[1] / f), 0) * CFP,
        //     this.height
        // );
        // new_ij[1] = Math.min(
        //     Math.max(Math.ceil(diff[0] / f), 0) * CFP,
        //     this.width
        // );
        // new_hw[0] = Math.max(
        //     Math.min(Math.floor((diff[1] + camera.hos) / f) * CFP, this.height),
        //     0
        // );
        // new_hw[1] = Math.max(
        //     Math.min(Math.floor((diff[0] + camera.wos) / f) * CFP, this.width),
        //     0
        // );

        new_ij[0] = 0;
        new_ij[1] = 0;
        new_hw[0] = this.height;
        new_hw[1] = this.width;

        if (new_ij[0] !== this.old_cam_ij[0] || new_ij[1] !== this.old_cam_ij[1]
         || new_hw[0] !== this.old_cam_hw[0] || new_hw[1] !== this.old_cam_hw[1]
         || this.is_dirty)
        {
            this.old_cam_ij = new_ij;
            this.old_cam_hw = new_hw;
            this.is_dirty = false;

            let tiles_w = new_hw[0] - new_ij[0];
            let tiles_h = new_hw[1] - new_ij[1];
            let nb_tiles = tiles_w * tiles_h;
            let indices = new Uint16Array(nb_tiles * 6);
            let vertices = new Float32Array(nb_tiles * 8);

            // Vertex buffer
            let index = 0;
            let indices_index = 0;

            for (let i = new_ij[0]; i < new_hw[0]; ++i) {
                for (let j = new_ij[1]; j < new_hw[1]; ++j) {
                    let first_index = index / 2;

                    vertices[index++] = this.pos[0] + this.tile_size * j;
                    vertices[index++] = this.pos[1] + this.tile_size * i;

                    vertices[index++] = this.pos[0] + this.tile_size * (j + 1);
                    vertices[index++] = this.pos[1] + this.tile_size * i;

                    vertices[index++] = this.pos[0] + this.tile_size * (j + 1);
                    vertices[index++] = this.pos[1] + this.tile_size * (i + 1);

                    vertices[index++] = this.pos[0] + this.tile_size * j;
                    vertices[index++] = this.pos[1] + this.tile_size * (i + 1);

                    indices[indices_index++] = first_index + 0;
                    indices[indices_index++] = first_index + 1;
                    indices[indices_index++] = first_index + 2;
                    indices[indices_index++] = first_index + 0;
                    indices[indices_index++] = first_index + 2;
                    indices[indices_index++] = first_index + 3;
                }
            }

            // Update the texture ids buffers.
            for (let i = 0; i < this.static_layers.length; ++i) {
                let origin = this.static_layers[i];
                this.dynamic_layers[i].updateAsViewOf(
                    origin,
                    new_ij, new_hw,
                    nb_tiles,
                    this.width
                );
            }

            this.index_buffer.fillTyped(indices);
            this.vertex_buffer.fillTyped(vertices);
        }
    }
}

// A partial layer, is a layer that
// can be rendered into only one draw call.
class PartialLayer {

    // Will be used by the shader to compute the
    // tex coordinates
    private texture_width_tile_space: number;
    private texture_height_tile_space: number;

    // Some of those ids are zero which is a special
    // value. (This field does not exists for the static_layers case)
    private tiles_id: Uint16Array = undefined;
    // This field does exists for the dynamic_layers case
    private tiles_id_buffer: VertexBuffer = undefined;
    private tiles_id_linked: BufferLinkedToProgram = undefined;

    static createForRendering(
        gl: WebGLRenderingContext,
        spl: PartialLayer
    ): PartialLayer {
        let pl = new PartialLayer(spl.texture);
        pl.tiles_id_buffer =
            new VertexBuffer(gl)
            .numberOfComponents(2);
        return pl;
    }

    static createFromRawData(
        tile_size: number,
        chipset: ChipsetLayer
    ): PartialLayer {
        let pl = new PartialLayer(chipset.chipset.tex_id);
        pl.texture_width_tile_space = chipset.chipset.width / tile_size;
        pl.texture_height_tile_space = chipset.chipset.height / tile_size;
        pl.tiles_id = chipset.tiles_id;
        return pl;
    }

    constructor(
        public texture: WebGLTexture
    ) {}

    setTileId(width: number, i: number, j: number, tile_id: number): void {
        this.tiles_id[i * width + j] = tile_id;
    }

    updateAsViewOf(
        origin: PartialLayer,
        new_ij: [number, number],
        new_hw: [number, number],
        nb_tiles: number,
        width_ts: number
    ) {
        let index = 0;
        let tex_ids = new Float32Array(nb_tiles * 8);
        let tex_wts = origin.texture_width_tile_space;
        let tex_hts = origin.texture_height_tile_space;

        for (let i = new_ij[0]; i < new_hw[0]; ++i) {
            for (let j = new_ij[1]; j < new_hw[1]; ++j) {
                let tex_id = origin.tiles_id[i * width_ts + j];

                if (tex_id == 0) {
                    tex_ids[index++] = 0;
                    tex_ids[index++] = 0;

                    tex_ids[index++] = 0;
                    tex_ids[index++] = 0;

                    tex_ids[index++] = 0;
                    tex_ids[index++] = 0;

                    tex_ids[index++] = 0;
                    tex_ids[index++] = 0;
                } else {
                    let tex_coord_x = tex_id - 1;
                    let tex_coord_y = Math.floor(tex_coord_x / tex_wts);
                    tex_coord_x = tex_coord_x % tex_wts;

                    tex_ids[index++] = tex_coord_x / tex_wts + 1;
                    tex_ids[index++] = tex_coord_y / tex_hts + 1;

                    tex_ids[index++] = (tex_coord_x + 1) / tex_wts + 1;
                    tex_ids[index++] = tex_coord_y / tex_hts + 1;

                    tex_ids[index++] = (tex_coord_x + 1) / tex_wts + 1;
                    tex_ids[index++] = (tex_coord_y + 1) / tex_hts + 1;

                    tex_ids[index++] = tex_coord_x / tex_wts + 1;
                    tex_ids[index++] = (tex_coord_y + 1) / tex_hts + 1;
                }

            }
        }

        this.tiles_id_buffer.fillTyped(tex_ids);
    }

    draw(
        gl: WebGLRenderingContext,
        program: Program,
        vertex_buffer: BufferLinkedToProgram,
        index_buffer: IndicesBuffer
    ) {
        program.setUniforms({
            tile_tex: this.texture,
        });

        if (!this.tiles_id_linked) {
            this.tiles_id_linked = new BufferLinkedToProgram(
                program,
                this.tiles_id_buffer,
                'tile_tex_coord'
            );
        }

        glDrawElements(Geom.TRIANGLES,
            gl, index_buffer,
            vertex_buffer,
            this.tiles_id_linked);
    }
}


// Layer shares the same vertex buffer.
// They differ in tiles_id and textures.
class Layer {

    // In a partial layers all tiles share the same texture
    // and tiles_ids are relative to that texture.
    partial_layers: Array<PartialLayer> = [];

    static createForRendering(
        gl: WebGLRenderingContext,
        sl: Layer
    ): Layer {
        let self = new Layer();
        for (let spl of sl.partial_layers) {
            self.partial_layers.push(
                PartialLayer.createForRendering(gl, spl)
            );
        }
        return self;
    }

    static createFromRawData(
        tile_size: number,
        layer_per_texture: Array<ChipsetLayer>
    ): Layer {
        let self = new Layer();
        for (let cl of layer_per_texture) {
            self.partial_layers.push(
                PartialLayer.createFromRawData(tile_size, cl)
            );
        }
        return self;
    }

    select(
        gl: WebGLRenderingContext,
        width: number,
        height: number,
        tile_size: number,
        chipset: number,
        dirty_flag: Function
    ): SelectedPartialLayer {
        let tmp = new SelectedPartialLayerImpl(
            gl,
            width,
            height,
            tile_size,
            {
                setTileId: (width: number, ts: number, i: number, j: number, tile_id: number) => {
                    this.partial_layers[chipset].setTileId(width, i, j, tile_id);
                },
                update: (gl: WebGLRenderingContext, width: number, height: number) => {
                    dirty_flag();
                }
            }
        );
        return tmp;
    }

    updateAsViewOf(
        origin: Layer,
        new_ij: [number, number],
        new_hw: [number, number],
        nb_tiles: number,
        width_ts: number
    ) {
        for (let i = 0; i < this.partial_layers.length; ++i) {
            let pl = origin.partial_layers[i];
            this.partial_layers[i].updateAsViewOf(
                pl,
                new_ij, new_hw,
                nb_tiles,
                width_ts
            );
        }
    }

    draw(
        gl: WebGLRenderingContext,
        program: Program,
        vertex_buffer: BufferLinkedToProgram,
        index_buffer: IndicesBuffer
    ) {
        for (let pl of this.partial_layers) {
            pl.draw(gl, program, vertex_buffer, index_buffer);
        }
    }
}
