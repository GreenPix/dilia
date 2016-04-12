import {info as winfo, error as werr, warn} from 'winston';
import {UserDocument} from '../db/schemas/users';
import {Response} from 'express';

export function success(res: Response, msg?: string): Response {
    winfo(msg || 'Request successufl');
    return res.status(200).json({
        message: msg || 'Request successful',
    });
}

export function notFound(res: Response, user?: UserDocument, msg?: string): Response {
    warn(msg || user && `Not found for ${user.username}` || `Not Found`);
    return res.status(404).json({
        message: msg || `Resource not found`,
    });
}

export function unauthorized(res: Response, msg: string | UserDocument, user?: UserDocument): Response {
    if (!(typeof msg === 'string')) {
        user = msg as UserDocument;
        msg = `Unauthorized access`;
    }
    if (user) {
        warn(`Unauthorized access by ${user.username}`);
    }
    return res.status(401).json({
        message: msg,
    });
}

export function badReq(res: Response, msg?: string, errors?: any): Response {
    warn(msg || 'Bad request');
    return res.status(400).json({
        message: msg || 'Bad request',
        errors: errors || {}
    });
}

export function serverError(res: Response, msg?: string): Response {
    werr(msg || 'Internal server error');
    return res.status(500).json({
        error: msg || 'Internal server error'
    });
}
