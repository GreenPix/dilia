import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {success, badReq} from './post_response_fmt';
import {MapData} from '../shared';
import {validateMapNew, validateMapCommit} from '../validators/api_map';
import {MapSchema, MapProperties} from '../db/schemas/map';
import {UserDocument} from '../db/schemas/users';

app.post('/api/maps/new', reqAuth, (req, res) => {
    // Validation
    if (!validateMapNew(req.body)) {
        return badReq(res, 'Invalid body', validateMapNew.errors);
    }
    // Processing
    let user: UserDocument = req.user;
    let map_data: MapData = req.body;
    // TODO

    return success(res);
});

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
