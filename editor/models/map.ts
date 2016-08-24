import {HttpService, Observable} from '../services';
import {Injectable} from '@angular/core';
import {CommitObject, Committer} from './commitable';
import {MapData, MapCommitData} from '../../shared/map';
import {intoBase64} from '../util/base64';

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

export class SelectedChipsetLayer {

    constructor(
        private width: number,
        private height: number,
        private chipset_layer: ChipsetLayer,
        private tile_size: number
    ) {}

    // TODO: There's duplication with SelectedPartialLayerImpl
    // TODO: also, the SelectedPartialLayer interface does not
    // TODO: seems very useful in the end. It adds unneeded
    // TODO: complexity and just look Java-ish.
    setTileId(x: number, y: number, tile_id: number) {
        let i, j;
        i = Math.floor(y / this.tile_size);
        j = Math.floor(x / this.tile_size);
        if (i >= 0 && i < this.height && j >= 0 && j < this.width) {
            this.chipset_layer.tiles_id[i * this.width + j] = tile_id;
        }
    }
}

export class Map implements CommitObject {

    private current_layer: number  = 0;

    public layers: Layer[] = [];
    public is_new: boolean = true;

    constructor(
        public name: string,
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

    select(layer_index: number, chipset_layer: number): SelectedChipsetLayer {
        return new SelectedChipsetLayer(
            this.width, this.height,
            this.layers[layer_index].raw[chipset_layer],
            this.tile_size
        );
    }
}

@Injectable()
export class MapManager implements Committer {

    private current_map: number = -1;
    private map_list: Array<Map> = [];

    constructor(
        private http: HttpService
    ) {}

    createMap(name: string, width: number, height: number): void {
        let map = new Map(name, width, height);
        // By default we have two layers
        map.addLayer([]);
        map.addLayer([]);
        this.map_list.push(map);
        this.current_map = 0;
    }

    openMap(sth: any) {
        // TODO
    }

    commit(map: Map, comment: string): Observable<any> {
        if (map.is_new) {
            let observable = this.http.post(`/api/map/new`, {
                name: map.name,
                layers: map.layers.map(l =>
                    l.raw.map(c => ({
                        tiles_id_base64: intoBase64(c.tiles_id),
                        chipset_id: c.chipset
                    }))
                ),
                width: map.width,
                height: map.height,
                tile_size: map.tile_size,
                comment,
            } as MapData);
            observable.subscribe(res => {
                if (res.status === 200) {
                    map.is_new = false;
                }
            });
            return observable;
        }
        return this.http.post(`/api/map/${map.name}/commit`, {
            layers: map.layers.map(l => l.raw.map(c => ({
                tiles_id_base64: intoBase64(c.tiles_id),
                chipset_id: c.chipset
            }))),
            comment,
        } as MapCommitData);
    }

    currentMap(): Map {
        if (this.current_map < 0) {
            return undefined;
        } else {
            return this.map_list[this.current_map];
        }
    }
}
