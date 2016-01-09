import {app} from '../config/express';
import {reqAuth} from './middlewares';
import {UserDocument} from '../db/schemas/users';

app.post('/api/map/new', reqAuth, (req, res) => {
  let user: UserDocument = req.user;
  let properties = {

  };
});
