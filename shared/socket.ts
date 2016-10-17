
export enum SocketMethod {
    GET,
    POST,
    UNSUBSCRIBE,
}

export interface SocketPacket {
    method: SocketMethod;
    apicall: string;
    value?: any;
}

export declare module SocketIOClient {
    interface Emitter {
        emit(event: 'data', data: SocketPacket): Emitter;
        emit(event: any, data: SocketPacket): Emitter;
    }
}
