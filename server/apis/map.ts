import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {UserDocument} from '../db/schemas/users';
import {error as werr} from 'winston';

app.post('/api/maps/new', reqAuth, (req, res) => {
  let user: UserDocument = req.user;
});

app.get('/api/chipset/:id', reqAuth, (req, res) => {
    let options = {
        root: 'public/'
    };
    res.sendFile('img/tiles.png', options, (err) => {
        if (err) {
            werr(err.message);
            res.status(404).json({ message: 'Chipset not found'});
        }
    });
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
