import {Texture} from '../../gl/gl';
import {Obj2D} from '../interfaces';

// This is a constant that encode
// the camera precision and will be used to check if there's a need
// for an update.
export const CFP = 2;


export interface ChipsetLayer {
    chipset: Texture;
    tiles_id: Uint16Array;
}

/// This interface is just here to enforce some
/// semantic in the creation of the TilesLayer and
/// hide functions that would confuse a user.
/// We could still improve it as some functions
/// declared here needs to be called after the others
/// have all been called (Design a Protocol basically).
export interface TilesLayerBuilder {

    // Builder pattern
    setWidth(w: number): this;
    setHeight(h: number): this;
    tileSize(ts: number): this;
    position(pos: [number, number]): this;

    // Requires a call to tileSize first.
    // Could be inforced with another interface.
    addLayer(layer_per_texture: Array<ChipsetLayer>): this;

    // Returns a handle to modify the data
    // later
    build(): TilesHandle;
}

/// This interface allows to modify
/// an existing object made of tiles.
export interface TilesHandle extends Obj2D {
    // Select a specific layer.
    select(layer_index: number, chipset: number): SelectedPartialLayer;
    // The layer inserted has the new position given here.
    insertEmptyLayer(layer_index: number): void;
    // TODO:
    insertChipset(layer_index: number, chipset_tex: Texture): void;
}

/// This interface allows to modify the id of
/// a specific place in the map
export interface SelectedPartialLayer {
    /// Set the tile id for the tile that contains
    /// the (x, y) coordinate.
    /// @param x is expressed in object space.
    /// @param y is expressed in object space.
    /// @param tile_id is relative to the chipset.
    setTileId(x: number, y: number, tile_id: number): void;
    /// Warn the partial layer that painting is over
    finalize(): void;
}

export interface TileIdSetter {
    setTileId(
        width: number, tile_size: number,
        i: number, j: number, tile_id: number): void;
    update(gl: WebGLRenderingContext, width: number, height: number): void;
}
