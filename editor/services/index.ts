import _ = require('lodash');
import {Injectable} from 'angular2/angular2';
import {Http, Response, Headers} from 'angular2/http';
import * as io from 'socket.io-client';

export class UniqueId {
    private id: string;

    constructor() {
        this.id = _.uniqueId();
    }

    get(): string {
        return this.id;
    }
}

export interface RxObservable<R> {
    subscribe(subscriber: (res: R) => void);
    map<U>(mapper: (res: R) => U): RxObservable<U>;
}

@Injectable()
export class HttpService {

    constructor(private http: Http) {}

    post(path: string, json?: any): RxObservable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(path, JSON.stringify(json || {}), {
            headers: headers
        });
    }

    get(path: string): RxObservable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.get(path, {
            headers: headers
        });
    }
}

@Injectable()
export class SocketIOService {

    private socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io();
    }

    emit(event: string, ...args: any[]) {
        this.socket.emit(event, ...args);
    }

    on(event: string, cb: Function) {
        this.socket.on(event, cb);
    }
}
