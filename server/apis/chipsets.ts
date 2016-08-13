import {UserDocument} from '../db/schemas/users';
import {app, upload} from '../config/express';
import {max_file_size} from '../config/index';
import {ChipsetModel, ChipsetProperties} from '../db/schemas/chipset';
import {errorToJson} from '../db/error_helpers';
import {reqAuth} from './middlewares';
import {badReq, success, serverError, notFound} from './post_response_fmt';
import {error as werr} from 'winston';


app.post('/api/chipset/upload/', reqAuth, upload.single('chipset'),
    (req, res) => {
        if (req.file.size > max_file_size) {
            badReq(res, 'File size is too big.');
        } else {
            let user: UserDocument = req.user;
            let properties: ChipsetProperties = {
                name: req.file.fieldname,
                author: user._id,
                raw_content: req.file.buffer
            };
            let chipset = new ChipsetModel(properties);
            chipset.save(err => {
                if (err) {
                    badReq(res, `Couldn't save chipset ${properties.name}`,
                        errorToJson(err));
                } else {
                    // TODO: emit on /api/chipset/new
                    success(res, `Saved new chipset ${properties.name}`);
                }
            });
        }
    });

app.get('/api/chipset/', reqAuth, (req, res) => {
    ChipsetModel.find({})
        .select('name')
        .exec((err, chipsets) => {
            if (err) {
                werr(err);
                serverError(res, `Couldn't get the list of chipsets.`);
            } else {
                res.status(200).json(chipsets.map(c => c.name));
            }
        });
});

app.get('/api/chipset/:name', reqAuth, (req, res) => {
    ChipsetModel.findOne({ name: req.params.name }, (err, chipset) => {
        if (err || !chipset) {
            if (err) werr(err);
            notFound(res, req.user);
        } else {
            res.status(200).json(chipset.toJsmap());
        }
    });
});
