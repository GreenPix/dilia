
import {Express} from 'express';

export interface SIOResponse {

}

export interface SIORequest {

}

export interface ExpressSocketIOWrapper extends Express {
    // io(event: string, cb: (res: SIOResponse, req: SIORequest) => void): void;
}

export function wrap(app: Express, io: SocketIO.Server): ExpressSocketIOWrapper {

    let wrapped_app = <ExpressSocketIOWrapper>app;

    // wrapped_app.io = (event: string, cb: (res: SIOResponse, req: SIORequest) => void) => {
    //
    // };

    return wrapped_app;
}
