import * as io from 'socket.io-client';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

import {Player} from './player';

// Definition of messages
export interface Point {
    x: number;
    y: number;
}

export const enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

export interface LycanEntityUpdate {
    entity_id: number;
    position: Point;
    speed: Point;
    pv: number;
}

export interface GameUpdate {
    kind: 'GameUpdate';
    entities: LycanEntityUpdate[];
}

export interface ThisIsYou {
    kind: 'ThisIsYou';
    entity: number;
}

export interface Response {
    kind: 'Response';
    code: number;
}

export interface NewEntity {
    kind: 'NewEntity';
    entity: number;
    position: Point;
    skin: number;
    pv: number;
}

export interface EntityHasQuit {
    kind: 'EntityHasQuit';
    entity: number;
}

export interface Damage {
    kind: 'Damage';
    source: number;
    victim: number;
    amount: number;
}

export interface Death {
    kind: 'Death';
    entity: number;
}

export type LycanMessage = GameUpdate
    | Response
    | ThisIsYou
    | NewEntity
    | EntityHasQuit
    | Damage
    | Death;


export interface LycanCommandAuthenticate {
    kind: 'Authenticate';
    guid: string;
    token: string;
}

export interface LycanOrderWalk {
    kind: 'Walk';
    entity: number;
    direction?: Direction;
}

export interface LycanOrderAttack {
    kind: 'Attack';
    entity: number;
}

export type LycanCommand = LycanCommandAuthenticate
    | LycanOrderWalk
    | LycanOrderAttack;

@Injectable()
export class LycanService {
    private input_stream: Subject<LycanMessage> = new Subject<LycanMessage>();
    private output_stream: Subject<LycanCommand> = new Subject<LycanCommand>();
    private output_sub: Subscription;
    private socket: SocketIOClient.Socket;

    constructor(private player: Player) {}

    connectToLycan() {
        if (this.socket) {
            this.socket.disconnect();
            this.output_sub.unsubscribe();
        }
        this.socket = io('ws://localhost:9010', {
            path: '/lycan',
        });
        this.socket.on('message', (message) => {
            let parsed = parse(message);
            if (parsed !== undefined) {
                this.input_stream.next(parsed);
            }
        });
        this.output_sub = this.output_stream
            .map(serialize)
            .subscribe(v => this.socket.send(v));

        let authenticate: LycanCommandAuthenticate = {
            kind: 'Authenticate',
            guid: '00000032-0000-0000-0000-000000000000',
            token: '50',
        };
        this.getInputStream()
            .filter(val => val.kind == 'ThisIsYou')
            .take(1)
            .subscribe(val => this.player.id = (val as ThisIsYou).entity);
        this.sendRawCommand(authenticate);
    }

    getInputStream(): Observable<LycanMessage> {
        return this.input_stream;
    }

    sendWalk(direction: Direction) {
        this.sendRawCommand({
            kind: 'Walk',
            entity: this.player.id,
            direction: direction
        });
    }

    sendStopWalk() {
        this.sendRawCommand({
            kind: 'Walk',
            entity: this.player.id,
        });
    }

    sendRawCommand(command: LycanCommand) {
        this.output_stream.next(command);
    }
}

interface RawLycanMessage {
    GameUpdate?: GameUpdate;
    ThisIsYou?: ThisIsYou;
    Response?: Response;
    NewEntity?: NewEntity;
    EntityHasQuit?: EntityHasQuit;
    Damage?: Damage;
    Death?: Death;
}

function parse(message: string): LycanMessage | undefined {
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
}

function serialize(command: LycanCommand): string {
    let res: any;
    switch (command.kind) {
        case 'Authenticate': {
            res = {
                GameCommand: {
                    Authenticate: [command.guid, command.token],
                }
            };
            break;
        }

        case 'Walk': {
            // WHY did I take North/South/East/West? It is stupid ...
            // :D
            let direction;
            switch (command.direction) {
                case Direction.UP:
                    direction = 'North';
                    break;
                case Direction.DOWN:
                    direction = 'South';
                    break;
                case Direction.LEFT:
                    direction = 'West';
                    break;
                case Direction.RIGHT:
                    direction = 'East';
                    break;
            }
            res = {
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
            res = {
                EntityOrder: {
                    entity: command.entity,
                    order: 'Attack',
                }
            };
            break;
        }
    }
    return JSON.stringify(res);
}
