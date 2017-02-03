import {UserDocument} from '../db/schemas/users';
import {app, upload} from '../config/express';
import {max_file_size} from '../config/index';
import {ChipsetSocketNewAPI} from '../shared';
import {ChipsetModel, ChipsetProperties} from '../db/schemas/chipset';
import {errorToJson} from '../db/error_helpers';
import {reqAuth} from './middlewares';
import {badReq, success, serverError, notFound} from './post_response_fmt';
import {error as werr} from 'winston';


app.post('/api/chipset/upload/', reqAuth, upload.single('chipset'),
    (req, res) => {
        if (req.file.size > max_file_size) {
            badReq(res, 'File size is too big.');
        } else if (req.file.mimetype.indexOf('image') === -1) {
            badReq(res, 'Only images are accepted.');
        } else {
            let name: string = req.body.chipset_name || req.file.filename;
            let user: UserDocument = req.user;
            let properties: ChipsetProperties = {
                name,
                author: user._id,
                raw_content: req.file.buffer,
                mime_type: req.file.mimetype,
            };
            let chipset = new ChipsetModel(properties);
            chipset.save(err => {
                if (err) {
                    badReq(res, `Couldn't save chipset '${properties.name}'`,
                        errorToJson(err));
                } else {
                    app.emitOn('/api/chipset/new', () => {
                      let value: ChipsetSocketNewAPI = {
                        name
                      };
                      return value;
                    });
                    success(res, `Saved new chipset '${properties.name}'`);
                }
            });
        }
    });

// Allocate a room to listen to chipset creations
app.io().room('/api/chipset/new');

app.get('/api/chipset/', reqAuth, (_req, res) => {
    ChipsetModel.find({})
        .select('id')
        .exec((err, chipsets) => {
            if (err) {
                werr(err);
                serverError(res, `Couldn't get the list of chipsets.`);
            } else {
                res.status(200).json(chipsets.map(c => c.id));
            }
        });
});

app.get('/api/chipset/:id/metadata', reqAuth, (req, res) => {
    ChipsetModel.findById(req.params.id, (err, chipset) => {
        if (err || !chipset) {
            if (err) werr(err);
            notFound(res, req.user);
        } else {
            res.status(200).json(chipset.toJsmap());
        }
    });
});

app.get('/api/chipset/:id', reqAuth, (req, res) => {
    ChipsetModel.findById(req.params.id, (err, chipset) => {
        if (err || !chipset) {
            if (err) werr(err);
            notFound(res, req.user);
        } else {
            res.writeHead(200, {
                'Content-Type': chipset.mime_type,
                'Content-Length': chipset.raw_content.length,
                'Accept-Ranges': 'bytes',
                // Chipset are supposed to be immutable, so
                // a chipset id can be used as ETag.
                'ETag': chipset.id,
            });
            res.end(chipset.raw_content);
        }
    });
});
