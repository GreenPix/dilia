import {Request, Response} from 'express';

export function reqAuth(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

export function reqAdmin(req: Request, res: Response, next: Function) {
    if (process.env.NODE_ENV == 'development') return next();
    res.sendStatus(401);
}
