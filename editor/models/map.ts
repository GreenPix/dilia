import {Injectable} from 'angular2/core';

/// This ChipsetLayer is the high level view
/// of the ChipsetLayer present in the `tile.ts` file.
/// While the tiles_id refer to the same thing, the
/// `chipset` properties differs in that one correspond
/// to the path of the image on the server and the other
/// correspond to the gpu memory data local to the client
export interface ChipsetLayer {
    tiles_id: Uint16Array;
    chipset: string;
}

export type Layer = ChipsetLayer[];

export class Map {

    public layers: Layer[] = [];
    private current_layer: number  = 0;

    constructor(
        public width: number,
        public height: number,
        public tile_size: number = 16
    ) {}

    addLayer(layer: Layer): void {
        this.layers.push(layer);
    }

    tileSize(): number {
        return this.tile_size;
    }

    numberOfLayers(): number {
        return this.layers.length;
    }

    currentLayer(): number {
        return this.current_layer;
    }

    selectLayer(index: number) {
        if (index > -1 && index < this.layers.length) {
            this.current_layer = index;
        }
    }
}

@Injectable()
export class MapManager {

    private current_map: number = -1;
    private map_list: Array<Map> = [];


    constructor() {
        let map = new Map(10, 4);
        map.addLayer([{
            tiles_id: new Uint16Array([
                457, 287, 287, 61, 62, 63, 92, 61, 62, 63,
                314, 317, 347, 314, 318, 314, 314, 318, 314, 314,
                374, 347, 377, 374, 378, 374, 374, 378, 0, 374,
                373, 377, 377, 373, 373, 373, 373, 373, 373, 373
            ]),
            chipset: '/api/chipset/0'
        }]);
        map.addLayer([{
            tiles_id: new Uint16Array([
                0, 0, 389, 0, 389, 0, 0, 0, 0, 0,
                0, 0, 419, 0, 419, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]),
            chipset: '/api/chipset/0'
        }]);
        this.map_list.push(map);
        this.current_map = 0;
    }

    openMap(sth: any) {
        // TODO
    }

    commit() {
        // TODO
    }

    currentMap(): Map {
        return this.map_list[this.current_map];
    }
}
