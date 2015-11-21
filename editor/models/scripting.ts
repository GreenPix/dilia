import {Injectable} from 'angular2/angular2';
import {Response} from 'angular2/http';
import {AaribaFile} from '../shared';
import {HttpService, RxObservable, SocketIOService} from '../services/index';

export interface FileTab {
    index: number;
    content: string;
    name: string;
    active: boolean;
    readonly: boolean;
    isNew: boolean;
}

@Injectable()
export class FileManager {

    file_list: Array<FileTab>;
    current_file: number;

    constructor(
        private http: HttpService,
        private io: SocketIOService)
    {
        this.file_list = [
            { index: 0, name: 'test', active: true, readonly: true, content: '', isNew: false },
            { index: 1, name: 'hello world', active: false, readonly: true, content: '', isNew: false },
            { index: 2, name: 'foobar', active: false, readonly: false, content: '', isNew: false }
        ];
        // TODO: waiting for bugfix on typescript#5746
        let self = this;
        for (let file of this.file_list) {
            self.io.get<string>(`/api/aariba/${file.name}/liveupdate`)
                .subscribe(res => file.content = res);
        }
        this.current_file = 0;
    }

    createNewFile(previous_content: string): FileTab {
        let new_file: FileTab = {
            index: this.file_list.length,
            content: '',
            name: '',
            active: false,
            readonly: false,
            isNew: true
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
            readonly: false,
            isNew: false
        };
        this.file_list.push(new_file);
        this.edit(new_file, previous_content);
        return new_file;
    }

    edit(file: FileTab, previous_content: string) {
        // Set the previous_file content
        let previous_file = this.file_list[this.current_file];
        previous_file.active = false;
        previous_file.content = previous_content;

        // Open the next file
        file.active = true;
        this.current_file = file.index;
    }

    commit(file: FileTab, comment: string): RxObservable<Response> {
        if (file.isNew) {
            let observable = this.http.post(`/api/aariba/new`, {
                content: file.content,
                comment: comment,
                name: file.name,
            });
            observable.subscribe(res => {
                if (res.status === 200) {
                    file.isNew = false;
                }
            });
            return observable;
        }
        return this.http.post(`/api/aariba/${file.name}/commit`, {
            content: file.content,
            comment: comment,
        });
    }

    currentFile(): FileTab {
        return this.file_list[this.current_file];
    }
}
