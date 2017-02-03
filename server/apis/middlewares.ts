import {Request, Response} from 'express';

/**
 * Require authenticated user middleware.
 */
export function reqAuth(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) return next();
    res.sendStatus(401);
}

/**
 * Require admin user middleware.
 */
export function reqAdmin(_req: Request, res: Response, next: Function) {
    if (process.env.NODE_ENV === 'development') return next();
    res.sendStatus(401);
}
