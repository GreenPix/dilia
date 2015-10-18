import {UserDocument} from '../db/schemas/users';
import {app} from '../config/express';
import {reqAuth} from './middlewares';

app.get('/api/user/lastusedresources', reqAuth, (req, res) => {
    let user: UserDocument = req.user;
    res.json(user.lastUsedResources);
});
