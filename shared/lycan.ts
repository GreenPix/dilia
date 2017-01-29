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
    nominal_speed: number;
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

export const enum ErrorReason {
    SocketClosed,
    LycanServerNotReachable,
}

export interface Error {
    kind: 'Error';
    reason: ErrorReason;
}

export type LycanMessage = GameUpdate
    | Response
    | ThisIsYou
    | NewEntity
    | EntityHasQuit
    | Damage
    | Death
    | Error;


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

export interface LycanInitConnection {
    kind: 'InitConnection';
}

export type LycanCommand = LycanCommandAuthenticate
    | LycanInitConnection
    | LycanOrderWalk
    | LycanOrderAttack;