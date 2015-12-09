import {app} from '../config/express';
import {reqAuth} from './middlewares';

app.post('/api/map/new', reqAuth, (req, res) => {
  let user: UserDocument = req.user;
  let properties = {
    
  }
});
