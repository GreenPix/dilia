import {Types} from 'mongoose';
import {uniq, without} from 'lodash';
import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {success, badReq} from './post_response_fmt';
import {MapData} from '../shared';
import {validateMapNew, validateMapCommit} from '../validators/api_map';
import {MapModel, MapProperties} from '../db/schemas/map';
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
                'Not all chipset ids given exists within the database');
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
                layers: map_data.layers.map((l, i) => {
                    return l.map(d => ({
                        tile_ids: new Buffer(d.tiles_id_base64, 'base64'),
                        chipset: d.chipset_id as any,
                        depth: i
                    }));
                }).reduce((p, c) => p.concat(c), [])
            }]
        };
        let map = new MapModel(properties);
        map.save(err => {
            if (err) {
                badReq(res, `Couldn't save map '${properties.name}'`,
                    errorToJson(err));
            } else {
                // TODO: emit on /api/map/new
                success(res, `Saved new map '${properties.name}'`);
            }
        });
    }, err => {
        badReq(res, `Couldn't save map '${map_data.name}'`,
            errorToJson(err));
    });
});

app.io().room('/api/maps/new');

app.get('/api/maps/:id', reqAuth, (req, res) => {
    res.json({
        name: 'test',
        layers: [
            {
                chipsets_ids: [0],
                tile_size: 16,
                tiles_ids: [
                    8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
                    8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
                    8, 8, 8, 8, 8, 8, 8, 8, 8, 8
                ],
                width: 10,
                height: 3,
            }
        ]
    });
});

app.post('/api/maps/:id/commit', reqAuth, (req, res) => {
    // Validation
    if (!validateMapCommit(req.body)) {
        return badReq(res, 'Invalid body', validateMapCommit.errors);
    }
    // Processing
    let user: UserDocument = req.user;
    // TODO
    return success(res);
});
