import * as _ from 'lodash';
import {Express} from 'express';
import {info as  winfo} from 'winston';
import {UserDocument} from '../db/schemas/users';
import {SocketPacket, SocketMethod} from '../shared';
import {Router, ApiParams, ApiResolved} from './router/index';

export class SIOResponse {
    private _value: any;
    json(value: any) {
        this._value = value;
    }
    get value() {
        return this._value;
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

export interface SocketIOApiBuilder {
    stream(apicall: string, cb: ApiCall, ...then: ApiCall[]): void;
    room(apicall: string): void;
}

export interface ExpressSocketIOWrapper extends Express {
    io(): SocketIOApiBuilder;
    broadcast(apicall: string, value: any): void;
}

export function wrap(app: Express, io: SocketIO.Server): ExpressSocketIOWrapper {

    let wrapped_app = <ExpressSocketIOWrapper>app;

    let rooms: {
        [apicall: string]: {
            clients: Array<SocketIO.Socket>;
            api: ApiResolved<ApiCall>;
        }
    } = {};

    let router = new Router<ApiCall>();

    io.on('connection', socket => {
        winfo(`SocketIO Client connected`);

        socket.on('data', (packet: SocketPacket) => {
            if (!packet) return;
            // Get or register to a room
            if (packet.method === SocketMethod.GET) {
                if (packet.apicall in rooms) {
                    rooms[packet.apicall].clients.push(socket);
                } else {
                    rooms[packet.apicall] = {
                        clients: [],
                        api: router.resolve(packet.apicall)
                    };
                }
            }
            // Unsubscribe from a room
            if (packet.method === SocketMethod.UNSUBSCRIBE) {
                if (packet.apicall in rooms) {
                    _.remove(rooms[packet.apicall].clients, s => s === socket);
                }
            }
            // Post a new value
            if (packet.method === SocketMethod.POST) {
                if (packet.apicall in rooms) {
                    let api = rooms[packet.apicall].api;
                    let user = socket.request.user;
                    let req = new SIORequest(api.params, user, packet.value);
                    let res = new SIOResponse();
                    api.cb(req, res);
                    for (let client of rooms[packet.apicall].clients) {
                        client.emit('data', res);
                    }
                }
            }
        });

        socket.on('disconnected', () => {
            winfo(`SocketIO Client disconnected: ${socket.client}`);
        });
    });

    class ApiBuilder {
        stream(apicall_template: string, cb: ApiCall, ...then: ApiCall[]) {
            // TODO: Support Apicall middlewares
            router.addRoute(apicall_template, cb);
        }
        room() {}
    }

    let apiBuilder = new ApiBuilder();

    wrapped_app.broadcast = (apicall, value) => {
        if (apicall in rooms) {
            for (let client of rooms[apicall].clients) {
                client.emit(apicall, value);
            }
        }
    };
    wrapped_app.io = () => apiBuilder;

    return wrapped_app;
}
