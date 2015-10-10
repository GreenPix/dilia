import express = require('express');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');
import serveStatic = require('serve-static');
import passport = require('passport');
import csrf = require('csurf');

export var app = express();

// Express configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'TODO: handle session secret with a better solution',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(serveStatic('public'));

// adds CSRF support
if (process.env.NODE_ENV !== 'test') {
    // app.use(csrf());
    //
    // app.use((req, res, next) => {
    //     res.locals.csrf_token = req.csrfToken();
    //     next();
    // });
}
