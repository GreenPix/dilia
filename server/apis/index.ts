import {AaribaScript, AaribaScriptSchema} from '../db/schemas/aariba';
import {User} from '../db/schemas/users';
import {app} from '../config/express';
import {authenticate} from 'passport';
import {reqAuth} from './middlewares';
import {info as winfo, debug as wdebug, error as werror} from 'winston';

// Auth
require('./auth');

// User
require('./users');

// API calls
app.get('/api/aariba/', (req, res) => {
    // AaribaScript.mapReduce({
    //     map: function () {
    //         emit(this.name, 1);
    //     },
    //     reduce: (k, vals) => { return vals.length; },
    // })
    // .then((result) => {
    //     res.sendStatus(200);
    //     res.json(result[0]);
    // })
    res.sendStatus(200);
});

app.get('/api/aariba/:id', reqAuth, (req, res) => {
    AaribaScript.findOne({ _id: req.params.id }, (err, script) => {
        if (err || !script) {
            werror(err);
            res.sendStatus(404);
        } else {
            res.status(200);
            res.json(script.toJSON());
        }
    });
});

app.post('/api/aariba/new', reqAuth, (req, res, next) =>  {
    User.findById(req.user.id, (err, user) => {
        if (err) {
            // next(err);
            werror(`User not found: ${req.user.id}`);
            res.status(401).json(err);
        } else {
            let properties = <AaribaScriptSchema>_.merge({ contributors: [user._id] }, req.body);
            let script = new AaribaScript(properties);
            script.save((err) => {
                if (err) {
                    // next(err);
                    werror(`Couldn't save script: ${properties}`);
                    res.status(400).json({
                        'error': err
                    });
                } else {
                    // Saved new script !
                    winfo(`Saved new script '${properties.name}'!`);
                    res.sendStatus(200);
                }
            });
        }
    });
});
