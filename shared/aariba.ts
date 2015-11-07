
/// Get '/api/aariba'
export interface AaribaFileList {
    [file: string]: {
        is_locked: boolean;
    };
}
