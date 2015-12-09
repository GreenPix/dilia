import {Schema, model, Document, Types} from 'mongoose';

let mongooseMapSchema = new Schema({
  name: { type: String, maxlength: [
    30,
    'Name (`{VALUE}`) exceeds the ' +
    'maximum allowed length ({MAXLENGTH}).'
  ]}
});
