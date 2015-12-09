import {User} from '../db/schemas/users';
import {app} from '../config/express';
import {reqAuth} from './middlewares';

app.get('/api/user/lastusedresources', reqAuth, (req, res) => {
    User.findById(req.user.id, (err, user) => {
        res.json(user.lastUsedResources);
    });
});
