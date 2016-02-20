import {Injectable} from 'angular2/core';


export interface ChipsetLayer {
    tiles_id: Uint16Array;
    chipset_id: string;
}

export class Map {

    private layers: ChipsetLayer[] = [];
    private current_layer: number  = 0;

    constructor(
        private width: number,
        private height: number,
        private tile_size: number = 16
    ) {
        this.layers.push({
            tiles_id: new Uint16Array(width * height),
            chipset_id: null
        });
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
        this.map_list.push(new Map(10, 4));
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
