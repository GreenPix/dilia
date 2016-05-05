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

export class Layer {

    constructor(
        private owner: Map,
        public raw: ChipsetLayer[]
    ) {}

    select(): number {
        return this.owner.selectLayer(this);
    }
}

export class Map {

    public layers: Layer[] = [];
    private current_layer: number  = 0;

    constructor(
        public width: number,
        public height: number,
        public tile_size: number = 16
    ) {}

    addLayer(layer: ChipsetLayer[]): void {
        this.layers.push(new Layer(this, layer));
    }

    tileSize(): number {
        return this.tile_size;
    }

    widthInPx(): number {
        return this.width * this.tile_size;
    }

    heightInPx(): number {
        return this.height * this.tile_size;
    }

    numberOfLayers(): number {
        return this.layers.length;
    }

    currentLayer(): number {
        return this.current_layer;
    }

    selectLayer(layer: Layer): number {
        let index = this.layers.findIndex(l => l === layer);
        if (index > -1 && index < this.layers.length) {
            this.current_layer = index;
        }
        return index;
    }
}

@Injectable()
export class MapManager {

    private current_map: number = -1;
    private map_list: Array<Map> = [];

    createMap(name: string, width: number, height: number): void {
        let map = new Map(width, height);
        map.addLayer([{
            tiles_id: new Uint16Array(width * height),
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
        if (this.current_map < 0) {
            return undefined;
        } else {
            return this.map_list[this.current_map];
        }
    }
}
