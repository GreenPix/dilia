import {app, upload} from '../config/express';
import {max_file_size} from '../config/index';
import {reqAuth} from './middlewares';
import {badReq} from './post_response_fmt';
import {error as werr} from 'winston';


app.post('/api/chipset/upload/', reqAuth, upload.single('chipset'),
    (req, res) => {
        if (req.file.size > max_file_size) {
            badReq(res, 'File size is too big.');
        } else {

        }
    });

// Get a temporary image only stored in memory:
app.get('/api/chipset/tmp/:id', reqAuth, (req, res) => {
    
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
