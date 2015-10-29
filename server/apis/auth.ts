import {app} from '../config/express';
import {authenticate} from 'passport';
import {logRequest} from '../logger/helpers';

require('../config/passport');

// Verify
app.post('/api/verify', (req, res) => res.json({
    authenticated: req.isAuthenticated()
}));

// Local auth
app.post('/api/login', authenticate('local'), logRequest('has logged in.'),
    (req, res) => res.sendStatus(200));
app.post('/api/logout', logRequest('has logged out.'),
    (req, res) => { req.logout(); res.sendStatus(200); });

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
