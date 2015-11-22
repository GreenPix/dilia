import {error as werror} from 'winston';
import {app} from '../config/express';
import {AaribaScript} from '../db/schemas/aariba';
import {notFound} from './post_response_fmt';


app.get('/api/lycan/aariba/latest', (req, res) => {
    AaribaScript.findOne({ name: 'combat.ab' }, (err, script) => {
        if (err || !script) {
            werror(err || '');
            notFound(res);
        } else {
            res.send(200, script.getLatest().content);
        }
    });
});
