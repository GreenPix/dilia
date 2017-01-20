import * as _ from 'lodash';
import {Express} from 'express';
import {info as  winfo} from 'winston';
import {UserDocument} from '../db/schemas/users';
import {SocketPacket, SocketMethod, BroadcastPacket} from '../shared';
import {Router, ApiParams, ApiResolved} from './router/index';

export class SIOResponse {
    private _value: any;
    private _cb: Function;

    json(value: any): void {
        if (this._cb === null) {
            throw new Error('Already called json!');
        }
        this._value = value;
        if (this._cb) {
            this._cb();
            this._cb = null;
        }
    }

    get value() {
        return this._value;
    }

    onEmit(cb: Function) {
        this._cb = cb;
    }
}

export class SIORequest {
    constructor(
        private _params: ApiParams,
        private _user: UserDocument,
        private _body: any) {}

    get params(): ApiParams {
        return this._params;
    }

    get user(): UserDocument {
        return this._user;
    }

    get body() {
        return this._body;
    }
}

export interface ApiCall {
    (req: SIORequest, res: SIOResponse): void;
}

export class StreamingSocket {
    constructor(
        private socket: SocketIO.Socket,
        private channel: string
    ) {}

    send<O>(value: O): void {
        this.socket.emit('__streaming__' + this.channel, value);
    }

    ondisconnect(cb: Function): void {
        this.socket.on('disconnected', cb);
    }
}

export interface InputApiChannel<T, DataPerSocket> {
    (value: Partial<T>, data_per_socket: DataPerSocket): void;
}

export interface OutputApiChannel<DataPerSocket> {
    (socket: StreamingSocket): DataPerSocket;
}

export interface SocketIOApiBuilder {
    stream(apicall: string, cb: ApiCall, ...then: ApiCall[]): void;
    room(apicall: string): void;
    streaming<T, DPS>(apichannel: string, input: InputApiChannel<T, DPS>, output: OutputApiChannel<DPS>): void;
}

export interface ExpressSocketIOWrapper extends Express {
    io(): SocketIOApiBuilder;
    emitOn(apicall: string, cb: (user: UserDocument) => any): void;
}

export function wrap(app: Express, io: SocketIO.Server): ExpressSocketIOWrapper {

    let wrapped_app = app as ExpressSocketIOWrapper;

    let rooms: {
        [apicall: string]: {
            clients: Array<SocketIO.Socket>;
            api: ApiResolved<ApiCall>;
        }
    } = {};

    let input_stream_apis: {
        [apichannel: string]: InputApiChannel<any, any>;
    } = {};

    let output_stream_apis: {
        [apichannel: string]: OutputApiChannel<any>;
    } = {};

    let router = new Router<ApiCall>();

    function ensureRoomIsReady(packet: BroadcastPacket) {
        if (!(packet.apicall in rooms)) {
            rooms[packet.apicall] = {
                clients: [],
                api: router.resolve(packet.apicall)
            };
        }
    }

    io.on('connection', socket => {
        winfo(`SocketIO Client connected ${socket.client.id}`);

        let dpss: {
            [apichannel: string]: any
        } = {};

        for (let apichannel in output_stream_apis) {
            let output_api = output_stream_apis[apichannel];
            let dps = output_api(new StreamingSocket(socket, apichannel));
            dpss[apichannel] = dps;
        }

        socket.on('data', (packet: SocketPacket) => {
            if (!packet) return;

            // Broadcast messages between rooms.
            if (packet.type === 'broadcast') {
                ensureRoomIsReady(packet);

                // Get or register to a room
                if (packet.method === SocketMethod.GET) {
                    rooms[packet.apicall].clients.push(socket);
                }

                // Unsubscribe from a room
                if (packet.method === SocketMethod.UNSUBSCRIBE) {
                    if (packet.apicall in rooms) {
                        _.remove(rooms[packet.apicall].clients, s => s === socket);
                    }
                }

                // Post a new value
                if (packet.method === SocketMethod.POST) {
                    let api = rooms[packet.apicall].api;
                    let user = socket.request.user;
                    let req = new SIORequest(api.params, user, packet.value);
                    let res = new SIOResponse();
                    res.onEmit(() => {
                        for (let client of rooms[packet.apicall].clients) {
                            client.emit(packet.apicall, res.value);
                        }
                    });
                    api.cb(req, res);
                }

            }

            // Streaming packet.
            if (packet.type === 'streaming') {
                let apichannel = packet.apichannel
                let channel = input_stream_apis[apichannel];
                if (channel) {
                    channel(packet.value, dpss[apichannel]);
                }
            }
        });

        socket.on('disconnected', () => {
            winfo(`SocketIO Client disconnected: ${socket.client.id}`);
        });
    });

    class ApiBuilder implements SocketIOApiBuilder {
        stream(apicall_template: string, cb: ApiCall, ...then: ApiCall[]) {
            // TODO: Support Apicall middlewares
            router.addRoute(apicall_template, cb);
        }
        room() {}
        streaming<T, D>(apichannel: string, input: InputApiChannel<T, D>, output: OutputApiChannel<D>): void {
            output_stream_apis[apichannel] = output;
            input_stream_apis[apichannel] = input;
        }
    }

    let apiBuilder = new ApiBuilder();

    wrapped_app.emitOn = (apicall, cb) => {
        if (apicall in rooms) {
            for (let client of rooms[apicall].clients) {
                client.emit(apicall, cb(client.request.user));
            }
        }
    };
    wrapped_app.io = () => apiBuilder;

    return wrapped_app;
}
