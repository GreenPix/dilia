
export enum SocketMethod {
    GET,
    POST,
    UNSUBSCRIBE,
}

export type SocketPacket = BroadcastPacket | StreamingPacket;

export interface BroadcastPacket {
    type: 'broadcast';
    method: SocketMethod;
    apicall: string;
    value?: any;
}

export interface StreamingPacket {
    type: 'streaming';
    apichannel: string;
    value: any;
}

export declare module SocketIOClient {
    interface Emitter {
        emit(event: 'data', data: SocketPacket): Emitter;
        emit(event: any, data: SocketPacket): Emitter;
    }
}
