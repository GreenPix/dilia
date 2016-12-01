import * as io from 'socket.io-client';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

// Definition of messages
export interface Point {
    x: number;
    y: number;
}

export const enum Direction {
    Up,
    Down,
    Left,
    Right,
}

export interface LycanEntityUpdate {
    entity_id: number;
    position: Point;
    speed: Point;
    pv: number;
}

export interface LycanMessageGameUpdate {
    kind: 'GameUpdate';
    entities: [LycanEntityUpdate];
}

export interface LycanMessageThisIsYou {
    kind: 'ThisIsYou';
    entity: number;
}

export interface LycanMessageResponse {
    kind: 'Response';
    code: number;
}

export interface LycanMessageNewEntity {
    kind: 'NewEntity';
    entity: number;
    position: Point;
    skin: number;
    pv: number;
}

export interface LycanMessageEntityHasQuit {
    kind: 'EntityHasQuit';
    entity: number;
}

export interface LycanMessageDamage {
    kind: 'Damage';
    source: number;
    victim: number;
    amount: number;
}

export interface LycanMessageDeath {
    kind: 'Death';
    entity: number;
}

export type LycanMessage = LycanMessageGameUpdate | LycanMessageResponse |
    LycanMessageThisIsYou | LycanMessageNewEntity | LycanMessageEntityHasQuit |
    LycanMessageDamage | LycanMessageDeath;


export interface LycanCommandAuthenticate {
    kind: 'Authenticate';
    guid: string;
    token: string;
}

export interface LycanOrderWalk {
    kind: 'Walk';
    entity: number;
    direction: Direction | null;
}

export interface LycanOrderAttack {
    kind: 'Attack';
    entity: number;
}

export type LycanCommand = LycanCommandAuthenticate | LycanOrderWalk | LycanOrderAttack;

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
        });
        this.socket.on('message', (message) => {
            if (!this.subscriber) return;

            let parsed = parse(message);
            if (parsed !== null) {
                this.subscriber.next(parsed);
            }
        });

        this.mockThings();
    }

    getMessages(): Observable<LycanMessage> {
        return this.observable;
    }

    sendCommand(command: LycanCommand) {
        let message = serialize(command);
        this.socket.send(message);
    }

    // Mock code to be removed later
    private mockThings() {
        this.observable.subscribe({
            next: (message) => {
                console.log(`Parsed message: ${JSON.stringify(message)}`);

                // Start walking when receiving ThisIsYou
                if (message.kind == 'ThisIsYou') {
                    let me = message.entity;
                    let goUp: LycanOrderWalk = {
                        kind: 'Walk',
                        entity: me,
                        direction: Direction.Up,
                    };
                    this.sendCommand(goUp);
                }
            },
            error: (err) => { console.log('An error occured ' + err); },
        });

        let authenticate: LycanCommandAuthenticate = {
            kind: 'Authenticate',
            guid: '00000032-0000-0000-0000-000000000000',
            token: '50',
        };
        this.sendCommand(authenticate);
    }
}

interface RawLycanMessage {
    GameUpdate?: LycanMessageGameUpdate;
    ThisIsYou?: LycanMessageThisIsYou;
    Response?: LycanMessageResponse;
    NewEntity?: LycanMessageNewEntity;
    EntityHasQuit?: LycanMessageEntityHasQuit;
    Damage?: LycanMessageDamage;
    Death?: LycanMessageDeath;
}

function parse(message: string): LycanMessage | null {
    let json: RawLycanMessage = JSON.parse(message);
    if (json.ThisIsYou) {
        let ret = json.ThisIsYou;
        ret.kind = 'ThisIsYou';
        return ret;
    }
    if (json.Response) {
        let ret = json.Response;
        ret.kind = 'Response';
        return ret;
    }
    if (json.NewEntity) {
        let ret = json.NewEntity;
        ret.kind = 'NewEntity';
        return ret;
    }
    if (json.GameUpdate) {
        let ret = json.GameUpdate;
        ret.kind = 'GameUpdate';
        return ret;
    }
    if (json.EntityHasQuit) {
        let ret = json.EntityHasQuit;
        ret.kind = 'EntityHasQuit';
        return ret;
    }
    if (json.Damage) {
        let ret = json.Damage;
        ret.kind = 'Damage';
        return ret;
    }
    if (json.Death) {
        let ret = json.Death;
        ret.kind = 'Death';
        return ret;
    }

    console.log(`Warning: could not parse ${message}`);
    return null;
}

function serialize(command: LycanCommand): string {
    let json;
    switch (command.kind) {
        case 'Authenticate': {
            json = {
                GameCommand: {
                    Authenticate: [command.guid, command.token],
                }
            };
            break;
        }

        case 'Walk': {
            // WHY did I take North/South/East/West? It is stupid ...
            let direction;
            switch (command.direction) {
                case Direction.Up:
                    direction = 'North';
                    break;
                case Direction.Down:
                    direction = 'South';
                    break;
                case Direction.Left:
                    direction = 'West';
                    break;
                case Direction.Right:
                    direction = 'East';
                    break;
            }
            json = {
                EntityOrder: {
                    entity: command.entity,
                    order: {
                        Walk: direction,
                    }
                }
            };
            break;
        }

        case 'Attack': {
            json = {
                EntityOrder: {
                    entity: command.entity,
                    order: 'Attack',
                }
            };
            break;
        }
    }
    return JSON.stringify(json);
}
