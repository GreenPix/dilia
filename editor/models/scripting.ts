
import _ = require('lodash');

export interface FileTab {
    index: number;
    content: string;
    name: string;
    active: boolean;
    readonly: boolean;
}

export class FileManager {

    file_list: Array<FileTab>;
    current_file: number;

    constructor() {
        this.file_list = [
            { index: 0, name: "test", active: true, readonly: true, content: "" },
            { index: 1, name: "hello world", active: false, readonly: true, content: "" },
            { index: 2, name: "foobar", active: false, readonly: false, content: "" }
        ];
        this.current_file = 0;
    }

    open(file: FileTab, previous_content: string) {
        // Set the previous_file content
        let previous_file = this.file_list[this.current_file];
        previous_file.active = false;
        previous_file.content = previous_content;

        // Open the next file
        file.active = true;
        this.current_file = file.index;
    }

    currentFile(): FileTab {
        return this.file_list[this.current_file];
    }

    createNewFile(previous_content: string): FileTab {
        let new_file: FileTab = {
            index: this.file_list.length,
            content: '',
            name: '',
            active: false,
            readonly: false,
        };
        this.file_list.push(new_file);
        this.open(new_file, previous_content);
        return new_file;
    }
}
