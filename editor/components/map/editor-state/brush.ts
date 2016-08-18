import {SelectedPartialLayer} from '../../../rendering/tiles';
import {SpriteHandle} from '../../../rendering/sprite';


export class Brush {

    width: number = 1;
    tiles_ids: Uint16Array = new Uint16Array([93]);
    sprite: SpriteHandle;

    position(x: number, y: number): void {
        if (this.sprite) {
            x = Math.floor(x / 16) * 16;
            y = Math.floor(y / 16) * 16;

            let w = this.width;
            let h = this.tiles_ids.length / w;
            this.sprite.position([
                x - Math.floor(w / 2) ,
                y + Math.floor(h / 2)
            ]);
        }
    }

    paint(selected_layer: SelectedPartialLayer, x: number, y: number) {
        let w = this.width;
        let h = this.tiles_ids.length / w;
        for (let i = 0; i < this.tiles_ids.length; ++i) {
            let dx = (i % w) - Math.floor(w / 2);
            let dy = Math.floor(i / w) + Math.floor(h / 2);
            let tile_id = this.tiles_ids[i];
            selected_layer.setTileId(x + dx, y + dy, tile_id);
        }
        selected_layer.finalize();
    }

    replaceWith(width: number, tile_id: number) {
        this.tiles_ids[0] = tile_id;
        // Ugly hack fix this and have a proper function.
        (this.sprite as any).buildFromTileId(16, tile_id);
    }
}
