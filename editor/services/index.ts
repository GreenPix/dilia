import {uniqueId} from 'lodash';
import * as io from 'socket.io-client';
import {SocketPacket, SocketMethod} from '../shared';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Http, Response, Headers} from '@angular/http';
// Temporary
// import {getResponseURL, isSuccess} from '@angular/http';
// import {isPresent} from '@angular/common/facade/lang';
// import {ResponseOptions} from 'angular2/src/http/base_response_options';

export type Observable<T> = Observable<T>;

export class UniqueId {
    private id: string;

    constructor() {
        this.id = uniqueId();
    }

    get(): string {
        return this.id;
    }
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

    httpEvents(): Observable<HttpEvent> {
        return this.observable;
    }

    post(path: string, json?: any): Observable<Response> {
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

    get(path: string): Observable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.get(path, {
            headers: headers,
            body: ''
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

    get<T>(apicall: string): Observable<T> {
        return new Observable<T>((subscriber: Subscriber<T>) => {
            this.socket.on(apicall, (value) => subscriber.next(value));
            this.socket.emit('data', {
                apicall: apicall,
                method: SocketMethod.GET,
            } as SocketPacket);
            return () => {
                this.socket.emit('data', {
                    apicall: apicall,
                    method: SocketMethod.UNSUBSCRIBE,
                } as SocketPacket);
            };
        });
    }

    post<T>(apicall: string, data: T) {
        this.socket.emit('data', {
            apicall: apicall,
            method: SocketMethod.POST,
            value: data
        } as SocketPacket);
    }
}
