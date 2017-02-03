import {User, UserDocument} from '../db/schemas/users';
import {AaribaScript, AaribaScriptProperties} from '../db/schemas/aariba';
import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {errorToJson} from '../db/error_helpers';
import {error as werror} from 'winston';
import {warn} from 'winston';
import {AaribaFileList, AaribaFile} from '../shared';
import {accessControlManager, ResourceKind as RK} from '../resources';
import {success, badReq, unauthorized, notFound} from './post_response_fmt';
import {serverError} from './post_response_fmt';
import _ = require('lodash');


// API calls

// Get the list of scripts (name and lock status)
app.get('/api/aariba/', reqAuth, (req, res) => {
    AaribaScript.find({})
    .select('name')
    .exec((err, scripts) => {
        if (err) {
            werror(err);
            serverError(res, `Couldn't get the list of scripts.`);
            return;
        }
        let user: UserDocument = req.user;
        res.status(200);
        accessControlManager.updateLockOnResources();
        res.json(_.reduce(scripts, (acc, val) => {
            let is_locked = accessControlManager.isUsedBySomeoneOtherThanMe({
                kind: RK.AaribaScript,
                me: user._id,
                resource: val.name,
            });
            acc.push({
                locked: is_locked,
                name: val.name,
            });
            return acc;
        }, [] as AaribaFileList));
    });
});

// Obtain the content of a script
app.get('/api/aariba/:name', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            if (err) werror(err);
            notFound(res, req.user);
        } else {
            let script_reduced = script.toJsmap();

            User.findAll(script_reduced.revisions.map(r => r.author), (error, authors) => {
                if (error) return res.status(500).json(errorToJson(error));
                (script_reduced as any).revisions = script_reduced.revisions.map(r => {
                    return {
                        author: authors.get(r.author),
                        date: r.date,
                        comment: r.comment,
                    };
                });
                res.status(200).json(script_reduced);
            });
        }
    });
});

// Obtain the content of a script at a particular revision
app.get('/api/aariba/:name/revision/:rev', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(err);
            notFound(res, req.user);
        } else {
            let rev = script.getRevision(req.params.rev);
            User.findById(rev.author.toHexString(), (error, user) => {
                if (error) {
                    werror(err);
                    notFound(res, req.user);
                }
                res.status(200);
                rev.author = user.username as any;
                res.json(rev);
            });
        }
    });
});

// Try to lock a script.
app.post('/api/aariba/:name/lock', reqAuth, (req, res) => {
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(err || 'Script not found');
            notFound(res, req.user);
        } else {
            accessControlManager.updateLockOnResources();
            let succeed = accessControlManager.lockThisResource({
                owner: req.user._id,
                kind: RK.AaribaScript,
                resource: script.name
            });
            if (succeed) {
                success(res, `Succesfully locked '${script.name}'`);
            } else {
                badReq(res, `Couldn't locked '${script.name}'`);
            }
        }
    });
});

// Stream of the modified content of a script
app.io().stream('/api/aariba/:name/liveupdate', (req, res) => {

    // TODO: validate the req.body object
    // Send back the content to everyone
    res.json(req.body);

    let name = req.params['name'];

    // Obtain a lock on the resource
    accessControlManager.maintainLockOnResource({
        owner: req.user._id,
        kind: RK.AaribaScript,
        resource: name,
    });

    app.emitOn(`/api/aariba/lock_status`, (client) => {
      let value: AaribaFile = {
        name,
        locked: !req.user._id.equals(client._id),
      };
      return value;
    });

});

// Commit a new revision of a script
app.post('/api/aariba/:name/commit', reqAuth, (req, res) => {
    let user: UserDocument = req.user;
    AaribaScript.findOne({ name: req.params.name }, (err, script) => {
        if (err || !script) {
            werror(err);
            badReq(res, `Couldn't find script: ${req.params.name}`);
        } else {
            // If the resource is not locked by this user
            // then the commit is illegal.
            if (!accessControlManager.isUsedByMe({
                owner: user._id,
                kind: RK.AaribaScript,
                resource: script.name
            })) {
                warn(`User ${user.username} failed to commit on: \n` +
                      `==> '${script.name}' (locked)`
                );
                unauthorized(res, user);
                return;
            }

            // Commit a new revision
            script.commitRevision({
                author: user._id,
                comment: req.body.comment,
                content: req.body.content,
            }, error => {
                if (error) {
                    badReq(res, `Couldn't save script: '${script.name}'`, errorToJson(error));
                } else {
                    success(res, `Committed new version for '${script.name}'`);
                }
            });
        }
    });
});

// Create a new script aariba
app.post('/api/aariba/new', reqAuth, (req, res) =>  {
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
            badReq(res, `Couldn't save script: '${properties.name}'`, errorToJson(err));
        } else {
            app.emitOn('/api/aariba/new', (client) => {
              let value: AaribaFile = {
                name: properties.name,
                locked: !user._id.equals(client._id),
              };
              return value;
            });
            success(res, `Saved new script '${properties.name}'!`);
        }
    });
});

// Allocate a room to listen to scripts creations
app.io().room('/api/aariba/new');
