import {User, UserDocument} from '../db/schemas/users';
import {AaribaScript, AaribaScriptProperties} from '../db/schemas/aariba';
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
    .select('name')
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

// Obtain the content of a script at a particular revision
app.get('/api/aariba/:name/revision/:id', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(err);
            res.sendStatus(404);
        } else {
            res.status(200);
            res.json(script.getRevision(req.params.id));
        }
    });
});

// Commit a new revision of a script
app.post('/api/aariba/:name/commit', reqAuth, (req, res) => {
    let user: UserDocument = req.user;
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(err);
            res.sendStatus(400);
        } else {
            script.commitRevision({
                author: user._id,
                comment: req.body.comment,
                content: 'TODO',
            }, (err) => {
                if (err) {
                    werror(`Couldn't save script: '${script.name}'`);
                    res.status(500).json(errorToJson(err));
                } else {
                    winfo(`Committed new version for '${script.name}'`);
                    res.sendStatus(200);
                }
            });
        }
    });
})

// Create a new script aariba
app.post('/api/aariba/new', reqAuth, (req, res, next) =>  {
    let user: UserDocument = req.user;
    let properties: AaribaScriptProperties = {
        contributors: [user._id],
        revisions: [{
            author: user._id,
            content: req.body.content,
            comment: req.body.comment,
        }],
        name: req.body.name
    };
    let script = new AaribaScript(properties);
    script.save((err) => {
        if (err) {
            // next(err);
            werror(`Couldn't save script: ${properties.name}`);
            res.status(500).json(errorToJson(err));
        } else {
            // Saved new script !
            winfo(`Saved new script '${properties.name}'!`);
            res.sendStatus(200);
        }
    });
});
