import {app} from '../config/express';
import {authenticate} from 'passport';
import {logRequest} from '../logger/helpers';
import {unauthorized} from './post_response_fmt';

import '../config/passport';


// Verify
app.post('/api/verify', (req, res) => res.json({
    authenticated: req.isAuthenticated()
}));


// Local auth
app.post('/api/login', (req, res, next) => {
    authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) return (unauthorized(res, 'Invalid user or password'), undefined);
        req.logIn(user, (err) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({});
            }
        });
    })(req, res, next);
}, logRequest('has logged in.'));


// Logout
app.post('/api/logout', logRequest('has logged out.'),
    (req, res) => { req.logout(); res.status(200).json({}); });


// Google auth
app.get('/api/auth/google', authenticate('google', {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
}), () => {});
app.get('/api/auth/google/callback', authenticate('google'),
    (req, res) => res.sendStatus(200)
);


// Github auth
app.get('/api/auth/github', authenticate('github'), () => {});
app.get('/auth/github/callback', authenticate('github'),
    (req, res) => res.sendStatus(200)
);
