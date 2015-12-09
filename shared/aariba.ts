
export interface AaribaFile {
    name: string;
    locked: boolean;
}

/// Get '/api/aariba'
export type AaribaFileList = Array<AaribaFile>;
