import {SelectedPartialLayer, TileIdSetter} from './common';

export class SelectedPartialLayerImpl implements SelectedPartialLayer {

    constructor(
        private gl: WebGLRenderingContext,
        private width: number,
        private height: number,
        private tile_size: number,
        private pl: TileIdSetter
    ) {}

    setTileId(x: number, y: number, tile_id: number): void {
        let i; let j;
        i = Math.floor(y / this.tile_size);
        j = Math.floor(x / this.tile_size);
        if (i >= 0 && i < this.height && j >= 0 && j < this.width) {
            this.pl.setTileId(this.width, this.tile_size, i, j, tile_id);
        }
    }

    finalize() {
        this.pl.update(this.gl, this.width, this.height);
    }
}
