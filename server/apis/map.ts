import {Types} from 'mongoose';
import {uniq, without} from 'lodash';
import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {success, badReq, notFound, serverError} from './post_response_fmt';
import {unauthorized} from './post_response_fmt';
import {MapData, MapStatusExtra, MapStatus, MapCommitData, LayerData} from '../shared';
import {error as werror, warn} from 'winston';
import {accessControlManager, ResourceKind as RK} from '../resources';
import {validateMapNew, validateMapCommit} from '../validators/api_map';
import {MapModel, MapProperties, Layer} from '../db/schemas/map';
import {ChipsetModel} from '../db/schemas/chipset';
import {errorToJson} from '../db/error_helpers';
import {UserDocument} from '../db/schemas/users';

app.post('/api/maps/new', reqAuth, (req, res) => {
    // Validation
    if (!validateMapNew(req.body)) {
        return badReq(res, 'Invalid body', validateMapNew.errors);
    }
    // Processing
    let user: UserDocument = req.user;
    let map_data: MapData = req.body;
    let cs_ids = map_data.layers
        .map(l => l.map(c => c.chipset_id))
        .reduce((cs, ret) => uniq(ret.concat(cs)), []);

    ChipsetModel.find({
        _id: {
            $in: cs_ids.map(c => new Types.ObjectId(c)),
        }
    }).select('name').exec().then(cs => {
        if (without(cs_ids, ...cs.map(c => c.id)).length > 0) {
            badReq(res, `Couldn't save map '${map_data.name}'`,
                'Not all chipset ids provided exists within the database');
            return;
        }
        let properties: MapProperties = {
            contributors: [user._id],
            name: map_data.name,
            width: map_data.width,
            height: map_data.height,
            tile_size: map_data.tile_size,
            revisions: [{
                author: user._id,
                comment: map_data.comment,
                layers: intoInternalFmt(map_data.layers),
            }]
        };
        let map = new MapModel(properties);
        map.save(err => {
            if (err) {
                badReq(res, `Couldn't save map '${properties.name}'`,
                    errorToJson(err));
            } else {
                app.emitOn('/api/aariba/new', (client) => {
                    let value: MapStatus = {
                        name: properties.name,
                        locked: !user._id.equals(client._id),
                    };
                    return value;
                });
                success(res, `Saved new map '${properties.name}'`);
            }
        });
    }, err => {
        badReq(res, `Couldn't save map '${map_data.name}'`,
            errorToJson(err));
    });
});

app.io().room('/api/maps/new');

app.get('/api/maps/', reqAuth, (req, res) => {
    MapModel.find({})
        .select('name tile_size height width')
        .exec((err, maps) => {
            if (err) {
                werror(err);
                serverError(res, `Couldn't get the list of maps.`);
                return;
            }
            let user: UserDocument = req.user;
            accessControlManager.updateLockOnResources();
            res.json(maps.map(val => {
                let is_locked = accessControlManager.isUsedBySomeoneOtherThanMe({
                    kind: RK.Map,
                    me: user._id,
                    resource: val.name
                });
                return {
                    locked: is_locked,
                    name: val.name,
                    tile_size: val.tile_size,
                    height: val.height,
                    width: val.width,
                };
            }, [] as MapStatusExtra[]));
        });
});

app.get('/api/maps/:name', reqAuth, (req, res) => {
    MapModel.findOne({ name: req.params.name }, (err, map) => {
        if (err || !map) {
            if (err) werror(err);
            notFound(res, req.user);
        } else {
            res.status(200).json(map.toJsmap());
        }
    });
});

app.post('/api/maps/:name/lock', reqAuth, (req, res) => {
    MapModel.findOne({ name: req.params.name }, (err, map) => {
        if (err || !map) {
            werror(err || 'Map not found');
            notFound(res, req.user);
        } else {
            accessControlManager.updateLockOnResources();
            let succeed = accessControlManager.lockThisResource({
                owner: req.user._id,
                kind: RK.Map,
                resource: map.name
            });
            if (succeed) {
                success(res, `Succesfully locked '${map.name}'`);
            } else {
                badReq(res, `Couldn't locked '${map.name}'`);
            }
        }
    });
});

// Stream of the modified content of a script
app.io().stream('/api/maps/:name/liveupdate', (req, res) => {

    // TODO: validate the req.body object
    // Send back the content to everyone
    res.json(req.body);

    let name = req.params['name'];

    // Obtain a lock on the resource
    accessControlManager.maintainLockOnResource({
        owner: req.user._id,
        kind: RK.Map,
        resource: name,
    });

    app.emitOn(`/api/maps/lock_status`, (client) => {
      let value: MapStatus = {
        name: name,
        locked: !req.user._id.equals(client._id),
      };
      return value;
    });

});

app.post('/api/maps/:name/commit', reqAuth, (req, res) => {
    // Validation
    if (!validateMapCommit(req.body)) {
        return badReq(res, 'Invalid body', validateMapCommit.errors);
    }

    MapModel.findOne({ name: req.params.name }, (err, map) => {
        if (err || !map) {
            werror(err);
            badReq(res, `Couldn't find map: ${req.params.name}`);
        } else {
            // Processing
            let user: UserDocument = req.user;
            let commit: MapCommitData = req.body;

            if (!accessControlManager.isUsedByMe({
                owner: user._id,
                kind: RK.Map,
                resource: map.name
            })) {
                warn(`User ${user.username} failed to commit on: \n` +
                     `==> '${map.name}' (locked)`);
                unauthorized(res, user);
                return;
            }

            map.commitRevision({
                author: user._id,
                comment: commit.comment,
                layers: intoInternalFmt(commit.layers),
            }, err => {
                if (err) {
                    serverError(res, `Couldn't save map '${map.name}'`);
                } else {
                    success(res, `Committed new version for '${map.name}'`);
                }
            });
        }
    });
});


/// Convenience function to convert the layer into
/// the mongodb schema
function intoInternalFmt(layers: LayerData[][]): Layer[] {
    return layers.map((l, i) => {
        return l.map(d => ({
            tile_ids: new Buffer(d.tiles_id_base64, 'base64'),
            chipset: d.chipset_id as any,
            depth: i
        }));
    }).reduce((p, c) => p.concat(c), []);
}
