import * as io from 'socket.io-client';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

// Definition of messages
export interface Point {
    x: number;
    y: number;
}

export interface LycanMessagePosition {
    kind: 'position';
    entity: number;
    position: Point;
    speed: Point;
    pv: number;
}

export interface LycanMessageThisIsYou {
    kind: 'thisIsYou';
    entity: number;
}

export interface LycanMessageResponse {
    kind: 'response';
    code: number;
}

export interface LycanMessageNewEntity {
    kind: 'newEntity';
    entity: number;
    position: Point;
    skin: number;
    pv: number;
}

export interface LycanMessageEntityHasQuit {
    kind: 'entityHasQuit';
    entity: number;
}

export type LycanMessage = LycanMessagePosition | LycanMessageResponse |
    LycanMessageThisIsYou | LycanMessageNewEntity | LycanMessageEntityHasQuit;


@Injectable()
export class LycanService {
    private observable: Observable<LycanMessage>;
    private subscriber: Subscriber<LycanMessage>;
    private socket: SocketIOClient.Socket;

    constructor() {
        this.observable = new Observable<LycanMessage>(subscriber => {
            this.subscriber = subscriber;
        }).share();

        // TODO: rework how we connect to the lycan proxy
        this.socket = io('ws://localhost:9010', {
            path: '/lycan',
            //transports: ['websocket'],
        });
        this.socket.on('connect', () => {
            console.log('Connected to Lycan Proxy');
            let authenticate = '{"GameCommand":{"Authenticate":["00000032-0000-0000-0000-000000000000","50"]}}';
            this.socket.send(authenticate);
        });
        this.socket.on('message', (message) => {
            if (!this.subscriber) return;

            let parsed = parse(message);
            if (parsed !== null) {
                this.subscriber.next(parsed);
            }
        });

        // TODO: Remove this mock subscription
        this.observable.subscribe({
            next: (message) => {
                // Position message are just too frequent
                if (message.kind != 'position') {
                    console.log(`Parsed message: ${JSON.stringify(message)}`);
                }
            },
            error: (err) => { console.log('An error occured ' + err); },
        });
    }
}

interface RawLycanMessage {
    Position?: LycanMessagePosition;
    ThisIsYou?: LycanMessageThisIsYou;
    Response?: LycanMessageResponse;
    NewEntity?: LycanMessageNewEntity;
    EntityHasQuit?: LycanMessageEntityHasQuit;
}

function parse(message: string): LycanMessage | null {
    let json: RawLycanMessage = JSON.parse(message);
    if (json.ThisIsYou) {
        let ret = json.ThisIsYou;
        ret.kind = 'thisIsYou';
        return ret;
    }
    if (json.Response) {
        let ret = json.Response;
        ret.kind = 'response';
        return ret;
    }
    if (json.NewEntity) {
        let ret = json.NewEntity;
        ret.kind = 'newEntity';
        return ret;
    }
    if (json.Position) {
        let ret = json.Position;
        ret.kind = 'position';
        return ret;
    }
    if (json.EntityHasQuit) {
        let ret = json.EntityHasQuit;
        ret.kind = 'entityHasQuit';
        return ret;
    }

    console.log(`Warning: could not parse ${message}`);
    return null;
}
