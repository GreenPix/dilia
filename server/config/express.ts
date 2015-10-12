import {Request, Response} from 'express';
import {config} from './index';
import express = require('express');
import cookieParser = require('cookie-parser');
import compression = require('compression');
import bodyParser = require('body-parser');
import session = require('express-session');
import connectMongo = require('connect-mongo');
import serveStatic = require('serve-static');
import passport = require('passport');
import csrf = require('csurf');
import winston = require('winston');

export var app = express();

let MongoStore = connectMongo(session);

// Express configuration
app.use(compression());
app.use(serveStatic('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'TODO: handle session secret with a better solution',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        url: config().mongodb,
        collection: 'sessions',
    })
}));
app.use(passport.initialize());
app.use(passport.session());

// Error handler
app.use((err: any, req: Request, res: Response, next: Function) => {
    winston.error(err);
    res.status(400);
    res.json({
        error: err.message
    });
})


// adds CSRF support
if (process.env.NODE_ENV !== 'test') {
    // app.use(csrf());
    //
    // app.use((req, res, next) => {
    //     res.locals.csrf_token = req.csrfToken();
    //     next();
    // });
}
