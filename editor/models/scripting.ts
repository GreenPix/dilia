import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {AaribaFile} from '../shared';
import {HttpService, Observable, SocketIOService} from '../services';
import {CommitObject, Committer} from './commitable';
import * as some from 'lodash/some';
import * as filter from 'lodash/filter';

export interface FileTab extends CommitObject {
    index: number;
    content: string;
    active: boolean;
    readonly: boolean;
}

@Injectable()
export class FileManager implements Committer {

    private file_list: Array<FileTab> = [];
    private current_file: number = -1;

    fileList(): Array<FileTab> {
        return this.file_list;
    }

    constructor(
        private http: HttpService,
        private io: SocketIOService) {}

    createNewFile(previous_content: string): FileTab {
        let new_file: FileTab = {
            index: this.file_list.length,
            content: '',
            name: '',
            active: false,
            readonly: false,
            is_new: true,
            is_ready: true,
        };
        this.file_list.push(new_file);
        this.edit(new_file, previous_content);
        return new_file;
    }

    open(file: AaribaFile, content: string, previous_content: string): FileTab {
        let new_file: FileTab = {
            index: this.file_list.length,
            name: file.name,
            content: content,
            active: false,
            readonly: file.locked,
            is_new: false,
            is_ready: true,
        };
        this.file_list.push(new_file);
        this.edit(new_file, previous_content);
        return new_file;
    }

    editFilename(filename: string, previous_content: string): FileTab {
        let file = filter(this.file_list, f => f.name === filename)[0];
        if (file) {
            this.edit(file, previous_content);
        }
        return file;
    }

    edit(file: FileTab, previous_content: string) {
        // Set the previous_file content
        if (this.current_file >= 0) {
            let previous_file = this.file_list[this.current_file];
            previous_file.active = false;
            previous_file.content = previous_content;
        }

        // Open the next file
        file.active = true;
        this.current_file = file.index;
    }

    hasFile(filename: string): boolean {
        return some(this.file_list, file => file.name === filename);
    }

    commit(file: FileTab, comment: string): Observable<Response> {
        if (file.is_new) {
            let observable = this.http.post(`/api/aariba/new`, {
                content: file.content,
                comment: comment,
                name: file.name,
            });
            observable.subscribe(res => {
                if (res.status === 200) {
                    file.is_new = false;
                }
            });
            return observable;
        }
        return this.http.post(`/api/aariba/${file.name}/commit`, {
            content: file.content,
            comment: comment,
        });
    }

    hasAnyFile(): boolean {
        return this.current_file >= 0;
    }

    currentFile(): FileTab {
        return this.file_list[this.current_file];
    }
}
