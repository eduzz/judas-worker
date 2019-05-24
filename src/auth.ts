
import * as express from 'express';
import { token } from './config';

export default function authMiddleware(
    req: express.Request, 
    res: express.Response, 
    next: express.NextFunction
) {

    if (req.headers.authorization === token) {
        return next();
    }

    return res.status(422).json({
        error: 'invalid token'
    });
}