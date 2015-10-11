import {RequestHandler} from 'express';
import {info as winfo} from 'winston';

export function logRequest(message: string): RequestHandler {
    return (req, res, next) => {
        winfo(`User: ${req.user.username} ${message}`);
        next();
    };
}
