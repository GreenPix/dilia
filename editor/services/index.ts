import * as io from 'socket.io-client';
import {SocketPacket, SocketMethod} from '../shared';
import {Injectable} from '@angular/core';
import {NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';
import {Subject} from 'rxjs/Subject';
import {Http, Response, Headers} from '@angular/http';
// Temporary
// import {getResponseURL, isSuccess} from '@angular/http';
// import {isPresent} from '@angular/common/facade/lang';
// import {ResponseOptions} from 'angular2/src/http/base_response_options';

export type Observable<T> = Observable<T>;


export interface HttpEvent {

    /** success | warning | error | info */
    kind: string;

    errors?: { [index: string]: string };

    message: string;
}

@Injectable()
export class HttpService {

    private alert_stream: Subject<HttpEvent> = new Subject();

    constructor(private http: Http) {}

    httpEvents(): Observable<HttpEvent> {
        return this.alert_stream;
    }

    post<T>(path: string, json?: T): Observable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(path, JSON.stringify(json || {}), {
            headers
        }).do(
            res => this.injectHttpEvent(res),
            res => this.injectHttpEvent(res)
        );
    }

    get(path: string): Observable<Response> {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.get(path, {
            headers,
            body: ''
        });
    }

    private injectHttpEvent(res: Response) {
        if (!res) {
            this.alert_stream.next({
                kind: 'error',
                message: 'Server unreachable'
            });
        } else if (res.status === 200) {
            this.alert_stream.next({
                kind: 'success',
                message: res.json().message
            });
        } else if (res.status === 400) {
            let ev: any = res.json();
            this.alert_stream.next({
                kind: 'error',
                message: ev.message,
                errors: ev.errors
            });
        } else {
            this.alert_stream.next({
                kind: 'warning',
                message: res.json().message
            });
        }
    }
}

@Injectable()
export class SocketIOService {

    private socket: SocketIOClient.Socket;

    constructor(private zone: NgZone) {
        this.socket = io();
    }

    get<T>(apicall: string): Observable<T> {
        return new Observable<T>((subscriber: Subscriber<T>) => {
            this.socket.on(apicall, (value: T) =>
                this.zone.run(() => subscriber.next(value))
            );
            this.socket.emit('data', {
                type: 'broadcast',
                apicall,
                method: SocketMethod.GET,
            } as SocketPacket);
            return () => {
                this.socket.emit('data', {
                    type: 'broadcast',
                    apicall,
                    method: SocketMethod.UNSUBSCRIBE,
                } as SocketPacket);
            };
        });
    }

    post<T>(apicall: string, value: T) {
        this.socket.emit('data', {
            type: 'broadcast',
            apicall,
            method: SocketMethod.POST,
            value,
        } as SocketPacket);
    }

    dualStream<I, O>(apichannel: string, input: Observable<I>): Observable<O> {

        let res = new Observable<O>((subscriber: Subscriber<O>) => {

            let sub = input.subscribe(value => {
                this.socket.emit('data', {
                    type: 'streaming',
                    apichannel,
                    value
                } as SocketPacket);
            });
            this.socket.on('__streaming__' + apichannel, (value: O) => {
                this.zone.run(() => subscriber.next(value));
            });

            return () => {
                sub.unsubscribe();
            };
        });
        return res;
    }
}
