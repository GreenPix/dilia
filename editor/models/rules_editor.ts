
import _ = require('lodash');

export class FileManager {
    files: { [fileName: string]: File };

    constructor() {
        this.files = {};
    }

    fileNameList(): Array<string> {
        return _.keys(this.files);
    }
}
