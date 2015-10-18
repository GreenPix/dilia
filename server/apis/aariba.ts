import {User, UserDocument} from '../db/schemas/users';
import {AaribaScript, AaribaScriptProperties} from '../db/schemas/aariba';
import {app} from '../config/express';
import {authenticate} from 'passport';
import {reqAuth} from './middlewares';
import {errorToJson} from '../db/error_helpers';
import {info as winfo, debug as wdebug, error as werror} from 'winston';
import {warn as wwarn} from 'winston';
import {resourceManager, ResourceKind as RK} from '../resources';
import _ = require('lodash');


// API calls

// Get the list of scripts (name and lock status)
app.get('/api/aariba/', reqAuth, (req, res) => {
    AaribaScript.find({})
    .select('name')
    .exec((err, scripts) => {
        let user: UserDocument = req.user;
        res.status(200);
        res.json(_.reduce(scripts, (res, val) => {
            let is_locked = resourceManager.isUsedBy({
                kind: RK.AaribaScript,
                owner: user._id,
                resource: val._id,
            });
            res[val.name] = {
                is_locked: is_locked
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
            let script_reduced = script.toJsonResponse();

            User.findAll(script_reduced.revisions.map(r => r.author), (err, authors) => {
                if (err) return res.status(500).json(errorToJson(err));
                script_reduced.revisions = script_reduced.revisions.map(r => {
                    return {
                        author: authors.get(r.author),
                        date: r.date,
                        comment: r.comment,
                    }
                });
                res.status(200).json(script_reduced);
            });
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
            let rev = script.getRevision(req.params.id);
            User.findById(rev.author.toHexString(), (err, user) => {
                res.status(200);
                rev.author = user.username;
                res.json(rev);
            });
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
            // If the resource is not locked by this user
            // then the commit is illegal.
            if (!resourceManager.isUsedBy({
                owner: user._id,
                kind: RK.AaribaScript,
                resource: script._id
            })) {
                wwarn(`User ${user.username} failed to commit on: \n` +
                      `==> '${script.name}' (unauthorized)`
                );
                res.sendStatus(401);
                return;
            }

            // Commit a new revision
            script.commitRevision({
                author: user._id,
                comment: req.body.comment,
                content: req.body.content,
            }, err => {
                if (err) {
                    werror(`Couldn't save script: '${script.name}'`);
                    res.status(400).json(errorToJson(err));
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
    script.save(err => {
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
