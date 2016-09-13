
export interface MapInfo {
    name: string;
    width: number;
    height: number;
    tile_size: number;
}

export interface MapData extends MapInfo {
    preview: string;
    layers: LayerData[][];
    comment: string;
}

export interface MapStatus {
    id: string;
    locked: boolean;
}

export type MapStatusExtra = MapStatus & MapInfo;

export interface LayerData {
    tiles_id_base64: string;
    chipset_id: string;
}

export interface MapCommitData {
    layers: LayerData[][];
    comment: string;
}

export interface ChipsetData {
    name: string;
    author: string;
    created_on: string;
}

export interface MapJsmap {
    id: string;
    name: string;
    width: number;
    height: number;
    tile_size: number;
    created_on: string;
    layers: Array<Array<{
        tiles_ids: string;
        chipset: string;
    }>>;
    revisions: Array<{
        author: string;
        date: string;
        comment: string;
    }>;
}

export const ChipsetMaxFileSize = 20 * 1024 * 1024;
