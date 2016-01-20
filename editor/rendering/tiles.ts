import {Program, VertexBuffer} from '../gl/gl';
import {IndicesBuffer, BufferLinkedToProgram} from '../gl/gl';
import {Camera} from './camera';


// A note on how the process should be
//
// We perform the rendering for tiles as follow
// - We have a total of nb_tiles = width * height
// - We group tiles per chipset
//      - A render call consist of:
//        the chipset (uniform) 1
//        an indices buffer     nb_tiles * 12 (square) [0, 0, 0, 0, 0 (12 times), 1, 1, 1 ...]
//        the list of tiles     nb_tiles
//        (all the geometry is computed in the shader)
//      OR
//      - A render call with
//        the chipset
//        an indices buffer     nb_tiles * 12
//        a vertex buffer       (width + 1) * (height + 1) = nb_tiles + 1 + width + height
//        a list of tiles       nb_tiles
//        (nothing is computed in the shader)
//
//        This version can be further optimized:
//
//        We can reduce the vertex buffer to only the part that is visible + some data
//        Same for the list of tiles.
//
//        This requires some computation from time to time during the frames to know
//        what should be the new content of the vertex buffer.
//
// - We render them
//

// A partial layer, is a layer that
// can be rendered into only one draw call.
export class PartialLayer {

    private texture: WebGLTexture;
    // Will be used by the shader to compute the
    // tex coordinates
    private texture_width: number;
    private texture_height: number;

    // Some of those ids are zero which is a special
    // value.
    private tiles_id: Array<number>;
}


// Layer shares the same vertex buffer.
// They differ in tiles_id and textures.
export class Layer {

    // In a partial layers all tiles share the same texture
    // and tiles_ids are relative to that texture.
    private partial_layers: Array<PartialLayer>;
}

// This is a constant that encode
// the camera precision and will be used to check if there's a need
// for an update.
const CFP = 2;

/// Model defining an array of layers of tiles
/// This class is supposed to be used to create a layer that
/// has a great number of tiles.
/// The model is also assumed to be static, so some
/// computations are assumed to take place less often than others.
/// As a reference, if the number of tiles that fit within the camera
/// is less than the number of tiles your layer contains, then this
/// is probably not the abstraction you are looking for.
export class TilesLayer {

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
    private index_buffer: IndicesBuffer;

    // Previously stored camera position and bounds in tile space:
    private old_cam_ij: [number, number] = [0, 0];
    private old_cam_wh: [number, number] = [0, 0];

    constructor(gl: WebGLRenderingContext) {
        this.vertex_buffer = new VertexBuffer(gl).numberOfComponents(2);
        this.index_buffer = new IndicesBuffer(gl);
    }

    draw(program: Program, camera: Camera) {
        // Update content of buffers if needed
        this.updateBuffers(camera);
    }

    private updateBuffers(camera: Camera) {

        // Check if the update is needed or not.
        let new_ij: [number, number] = [0, 0];
        let new_wh: [number, number] = [0, 0];
        let f = CFP * this.tile_size;

        let diff: [number, number] = [
            camera.pos[0] - this.pos[0],
            camera.pos[1] - this.pos[1]
        ];

        // Compute the new position of the camera in tile space
        new_ij[0] = Math.min(
            Math.max(Math.ceil(diff[0] / f), 0) * CFP,
            this.width
        );
        new_ij[1] = Math.min(
            Math.max(Math.ceil(diff[1] / f), 0) * CFP,
            this.height
        );
        new_wh[0] = Math.max(
            Math.min(Math.floor((diff[0] + camera.wos) / f) * CFP, this.width),
            0
        );
        new_wh[1] = Math.max(
            Math.min(Math.floor((diff[1] + camera.hos) / f) * CFP, this.height),
            0
        );


        if (new_ij[0] !== this.old_cam_ij[0] || new_ij[1] !== this.old_cam_ij[1]
         || new_wh[0] !== this.old_cam_wh[0] || new_wh[1] !== this.old_cam_wh[1])
        {
            this.old_cam_ij = new_ij;
            this.old_cam_wh = new_wh;

            let tiles_w = new_wh[0] - new_ij[0];
            let tiles_h = new_wh[1] - new_ij[1];
            let nb_tiles = tiles_w * tiles_h;
            let indices = new Uint16Array(nb_tiles * 6);
            let vertices = new Float32Array((tiles_w + 1) * (tiles_h + 1) * 2);

            // Vertex buffer
            let index = 0;
            for (let i = new_ij[0]; i < new_wh[0] + 1; ++i) {
                for (let j = new_ij[1]; j < new_wh[1] + 1; ++j) {
                    // let index = (i - new_ij[0]) * tiles_w + (j - new_ij[1]);
                    vertices[index++] = this.pos[0] + this.tile_size * i;
                    vertices[index++] = this.pos[1] + this.tile_size * j;
                }
            }

            // Indices buffer
            index = 0;
            for (let i = new_ij[0]; i < new_wh[0]; ++i) {
                for (let j = new_ij[1]; j < new_wh[1]; ++j) {
                    // First triangle
                    indices[index++] = (i - new_ij[0] + 1) * tiles_w + (j - new_ij[1] + 0);
                    indices[index++] = (i - new_ij[0] + 0) * tiles_w + (j - new_ij[1] + 0);
                    indices[index++] = (i - new_ij[0] + 0) * tiles_w + (j - new_ij[1] + 1);
                    // Second one
                    indices[index++] = (i - new_ij[0] + 1) * tiles_w + (j - new_ij[1] + 0);
                    indices[index++] = (i - new_ij[0] + 0) * tiles_w + (j - new_ij[1] + 1);
                    indices[index++] = (i - new_ij[0] + 1) * tiles_w + (j - new_ij[1] + 1);
                }
            }

            this.index_buffer.fillTyped(indices);
            this.vertex_buffer.fillTyped(vertices);
        }
    }
}
