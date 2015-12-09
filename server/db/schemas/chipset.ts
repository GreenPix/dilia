import {Scheman, model, Document, Types} from 'mongoose';

// This is the store for chipsets.
// The API should be immutable as chipsets
// are referenced by maps and objects.
let mongooseChipsetSchema = new Schema({
  name: { type: String },
  created_on: { type: Date, default: Date.now },
  raw_content: Buffer,
});
