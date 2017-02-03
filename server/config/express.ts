import {Request, Response} from 'express';
import {config, max_file_size} from './index';
import {wrap} from './socket.io';
import {authorize as passSocketIOAuth} from 'passport.socketio';
import {createServer} from 'http';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo';
import * as serveStatic from 'serve-static';
import * as passport from 'passport';
// import csrf = require('csurf');
import * as winston from 'winston';
import * as socket_io from 'socket.io';
import * as multer from 'multer';


let expressApp = express();

export const server = createServer(expressApp);
export const io = socket_io(server);
export const app = wrap(expressApp, io);
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: max_file_size,
        files: 1,
    },
});

let MongoStore = connectMongo(session);
let cookieParserM = cookieParser();

let sessionOptions = {
    secret: 'TODO: handle session secret with a better solution',
    key:    'dilia.session-id',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        url: config().mongodb,
        collection: 'sessions',
    })
};

// Express configuration
app.use(compression());
app.use(serveStatic('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParserM);
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// Socket.io auth
io.use(passSocketIOAuth({
    cookieParser,
    key: sessionOptions.key,
    secret: sessionOptions.secret,
    store: sessionOptions.store,
    success: (_data, accept) => {
        winston.info(`Successful connection to socket.io!`);
        accept();
    },
    fail: (_data, message, error, accept) => {
        winston.info(`Failed connection to socket.io: ${message}`);
        if (error) {
            accept(new Error(message));
        }
    },
}));

// Error handler
app.use((err: any, _req: Request, res: Response, _next: Function) => {
    winston.error(err);
    res.status(400);
    res.json({
        error: err.message
    });
});


// adds CSRF support
if (process.env.NODE_ENV !== 'test') {
    // app.use(csrf());
    //
    // app.use((req, res, next) => {
    //     res.locals.csrf_token = req.csrfToken();
    //     next();
    // });
}
