import {User} from '../db/schemas/users';
import {AaribaScript, AaribaScriptSchema} from '../db/schemas/aariba';
import {app} from '../config/express';
import {authenticate} from 'passport';
import {reqAuth} from './middlewares';
import {errorToJson} from '../db/error_helpers';
import {info as winfo, debug as wdebug, error as werror} from 'winston';
import _ = require('lodash');


declare var emit;

// API calls
app.get('/api/aariba/', reqAuth, (req, res) => {
    AaribaScript.mapReduce({
        map: function () {
            emit(
                // Key: name of the script
                this.name,
                // Value: user id owning the script
                (this.locked_by && this.locked_by.str) || 'none'
            );
        },
        reduce: (k, vals) => { return vals; },
    })
    .then((result) => {
        res.status(200);
        res.json(_.reduce(result, (res, val) => {
            let locked_by: string = <any>(val.value);
            res[<string>val._id] = {
                is_locked: locked_by !== req.user._id.toString() && locked_by !== 'none'
            };
            return res;
        }, {}));
    })
});

app.get('/api/aariba/:id', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.id }, (err, script) => {
        if (err || !script) {
            werror(err);
            res.sendStatus(404);
        } else {
            res.status(200);
            res.json(script.toJsonResponse());
        }
    });
});

app.post('/api/aariba/new', reqAuth, (req, res, next) =>  {
    User.findById(req.user.id, (err, user) => {
        if (err) {
            // next(err);
            werror(`User not found: ${req.user.id}`);
            res.status(401).json(errorToJson(err));
        } else {
            let properties = <AaribaScriptSchema>_.merge({
                contributors: [user._id],
                locked_by: user._id,
            }, req.body);
            let script = new AaribaScript(properties);
            script.save((err) => {
                if (err) {
                    // next(err);
                    werror(`Couldn't save script: ${properties.name}`);
                    res.status(400).json(errorToJson(err));
                } else {
                    // Saved new script !
                    winfo(`Saved new script '${properties.name}'!`);
                    res.sendStatus(200);
                }
            });
        }
    });
});
