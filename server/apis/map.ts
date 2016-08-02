// TODO: remove me
/* tslint:disable */
import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {MapData, LayerData, ChipsetData} from '../shared';
import {MapSchema, MapProperties} from '../db/schemas/map';
import {UserDocument} from '../db/schemas/users';

app.post('/api/maps/new', reqAuth, (req, res) => {
    let user: UserDocument = req.user;
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
    let user: UserDocument = req.user;
});
