import {error as werror} from 'winston';
import {LycanConnection} from './connection';
import {app} from '../../config/express';
import {AaribaScript} from '../../db/schemas/aariba';
import {notFound} from '../post_response_fmt';
import {LycanCommand} from '../../shared';


// HTTP Apis

app.get('/api/lycan/aariba/latest', (_req, res) => {
    AaribaScript.findOne({ name: 'combat.ab' }, (err, script) => {
        if (err || !script) {
            werror(err || '');
            notFound(res);
        } else {
            res.send(200, script.getLatest().content);
        }
    });
});


// Socket IO Apis

app.io().streaming<LycanCommand, LycanConnection>('/api/lycan', (value, dps) => {
    if (!value) return;
    dps.send(value);
}, socket => new LycanConnection(socket));

