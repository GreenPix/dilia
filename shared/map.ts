
export interface MapData {
    name: string;
    layers: LayerData[][];
    width: number;
    height: number;
    tile_size: number;
    comment: string;
}

export interface MapStatus {
    name: string;
    locked: boolean;
}

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
    raw_content: string;
}

export const ChipsetMaxFileSize = 20 * 1024 * 1024;
