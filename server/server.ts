
import express = require('express');
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');
import passport = require('passport');
import serveStatic = require('serve-static');
import {Strategy as LocalStrategy} from 'passport-local';
import BadRequestError = require('./errors/BadRequest');

let app = express();

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

// Passport configuration
passport.use(new LocalStrategy((username, password, done) => {
    if (username == "test" && password == "test") {
        done(null, { userInfo: "tada!" });
    } else {
        done(new BadRequestError('Wrong username or password.'));
    }
}));
passport.serializeUser((user, done) => {
    let id = 0;
    done(null, id);
})
passport.deserializeUser((id, done) => {
    done(null, { id: id });
});

// API calls
app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json({ username: req.user.username });
});

app.post('/api/logout', (req, res) => {
    req.logout();
    res.sendStatus(200);
});

app.get('/api/maps', (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.sendStatus(401);
    }
});


let port = 3000;

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});
