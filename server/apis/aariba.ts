import {User, UserDocument} from '../db/schemas/users';
import {AaribaScript, AaribaScriptSchema} from '../db/schemas/aariba';
import {app} from '../config/express';
import {authenticate} from 'passport';
import {reqAuth} from './middlewares';
import {errorToJson} from '../db/error_helpers';
import {info as winfo, debug as wdebug, error as werror} from 'winston';
import _ = require('lodash');


// API calls

// Get the list of scripts (name and lock status)
app.get('/api/aariba/', reqAuth, (req, res) => {
    AaribaScript.find({})
    .select('name locked_by')
    .exec((err, scripts) => {
        res.status(200);
        res.json(_.reduce(scripts, (res, val) => {
            let locked_by = val.locked_by;
            res[val.name] = {
                is_locked: !!locked_by &&
                    locked_by.toString() !== req.user._id.toString()
            };
            return res;
        }, {}));
    });
});

// Lock a particular script
app.post('/api/aariba/:name/lock', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(`Error while trying to lock ${req.params.name}: ${err}`);
            res.sendStatus(404);
        } else {
            script.locked_by = req.user._id;
            script.save((err) => {
                if (err) {
                    werror(`Couldn't lock script: ${req.params.name}` +
                     `for user ${req.user.username}`);
                    res.status(500);
                } else {
                    res.status(200);
                }
            });
        }
    });
});

// Obtain the content of a script
app.get('/api/aariba/:name', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
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
    let user: UserDocument = req.user;
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
});
