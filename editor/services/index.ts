import * as _ from 'lodash';
import * as io from 'socket.io-client';
import {SocketPacket, SocketMethod} from '../shared';
import {Injectable} from '@angular/core';
import {Observable, Subscriber, Subscription} from 'rxjs';
import {Http, Response, Headers} from '@angular/http';
// Temporary
import {ResponseType} from '@angular/http';
// import {getResponseURL, isSuccess} from '@angular/http';
// import {isPresent} from '@angular/common/facade/lang';
// import {ResponseOptions} from 'angular2/src/http/base_response_options';

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
    subscribe(subscriber: (res: R) => void, error?: (err: any) => void): Subscription;
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

    // postFile(path: string, data: FormData | Blob): RxObservable<Response> {
    //
    //     return new Observable<Response>((subscriber: Subscriber<Response>) => {
    //         let xhr = new XMLHttpRequest();
    //         xhr.withCredentials = true;
    //
    //         // TODO: CHECK THIS
    //         let onLoad = () => {
    //             // responseText is the old-school way of retrieving response (supported by IE8 & 9)
    //             // response/responseType properties were introduced in XHR Level2 spec (supported by
    //             // IE10)
    //             let body = isPresent(xhr.response) ? xhr.response : xhr.responseText;
    //
    //             let headers = Headers.fromResponseHeaderString(xhr.getAllResponseHeaders());
    //
    //             let url = getResponseURL(xhr);
    //
    //             // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
    //             let status: number = xhr.status === 1223 ? 204 : xhr.status;
    //
    //             // fix status code when it is 0 (0 status is undocumented).
    //             // Occurs when accessing file resources or on Android 4.1 stock browser
    //             // while retrieving files from application cache.
    //             if (status === 0) {
    //                 status = body ? 200 : 0;
    //             }
    //             let responseOptions = new ResponseOptions({body, status, headers, url});
    //             let response = new Response(responseOptions);
    //             if (isSuccess(status)) {
    //                 subscriber.next(response);
    //                 subscriber.complete();
    //                 return;
    //             }
    //             subscriber.error(response);
    //         };
    //
    //         // TODO: CHECK THIS
    //         let onError = (err) => {
    //             let responseOptions = new ResponseOptions({body: err, type: ResponseType.Error});
    //             subscriber.error(new Response(responseOptions));
    //         };
    //
    //         // TODO: CHECK THIS
    //         xhr.onreadystatechange = function () {
    //             if (this.readyState === 4) {
    //                 console.log(this.responseText);
    //             }
    //         };
    //
    //         xhr.open('POST', path);
    //         xhr.addEventListener('load', onLoad);
    //         xhr.addEventListener('error', onError);
    //         xhr.send(data);
    //
    //         return () => {
    //             xhr.removeEventListener('load', onLoad);
    //             xhr.removeEventListener('error', onError);
    //             xhr.abort();
    //         };
    //     });
    // }

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

    get<T>(apicall: string): RxObservable<T> {
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
