import _ = require('lodash');
import {Injectable} from 'angular2/angular2';
import {Observable, Subscriber} from '@reactivex/rxjs';
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

export interface HttpEvent {

    /** success | warning | error | info */
    kind: string;

    errors?: { [index: string]: string };

    message: string;
}

@Injectable()
export class HttpService {

    private observable: Observable<HttpEvent>;
    private _subscriber: Subscriber<HttpEvent>;

    constructor(private http: Http) {
        this.observable = new Observable<HttpEvent>(subscriber => {
            this._subscriber = subscriber;
        }).share();
    }

    httpEvents(): RxObservable<HttpEvent> {
        return this.observable;
    }

    post(path: string, json?: any): RxObservable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        let observable = this.http.post(path, JSON.stringify(json || {}), {
            headers: headers
        }).share();
        observable.subscribe(
            res => this.injectHttpEvent(res),
            res => this.injectHttpEvent(res)
        );
        return observable;
    }

    get(path: string): RxObservable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.get(path, {
            headers: headers
        });
    }

    private injectHttpEvent(res: Response) {
        if (!this._subscriber) return;
        if (!res) {
                this._subscriber.next({
                    kind: 'error',
                    message: 'Server unreachable'
                });
        }
        else if (res.status === 200) {

            this._subscriber.next({
                kind: 'success',
                message: (<any>res.json()).message
            });
        }
        else if (res.status === 400) {
            let ev: any = res.json();
            this._subscriber.next({
                kind: 'error',
                message: ev.message,
                errors: ev.errors
            });
        }
        else {
            this._subscriber.next({
                kind: 'warning',
                message: (<any>res.json()).message
            });
        }
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
