import _ = require('lodash');
import {Injectable} from 'angular2/angular2';
import {Http, Response, Headers} from 'angular2/http';

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
}
