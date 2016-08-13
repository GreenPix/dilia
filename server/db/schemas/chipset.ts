import {Schema, model, Document, Types} from 'mongoose';
import {pick} from 'lodash';

// This is the store for chipsets.
// The API should be immutable as chipsets
// are referenced by maps and objects.
const mongooseChipsetSchema = new Schema({
  name: { type: String },
  created_on: { type: Date, default: Date.now },
  raw_content: Buffer,
  author: Schema.Types.ObjectId,
});

export interface ChipsetProperties {
    name: string;
    created_on?: Date;
    author: Types.ObjectId;
    raw_content: Buffer;
}

export interface ChipsetJsmap {
    name: string;
    author: string;
    created_on: Date;
    raw_content: string;
}

export interface ChipsetSchema extends ChipsetProperties {

    toJsmap(): ChipsetJsmap;
}

mongooseChipsetSchema.method({
    toJsmap: function (): ChipsetJsmap {
        let self: ChipsetSchema = this;
        let into: ChipsetJsmap = {} as any;
        into.name = self.name;
        into.created_on = self.created_on;
        into.author = self.author.toHexString();
        into.raw_content = self.raw_content.toString('base64');
        return into;
    }
});

mongooseChipsetSchema.path('name').validate(function (name) {
    return name.length;
}, 'Name cannot be empty');

mongooseChipsetSchema.path('name').validate(function (name, cb) {
    if (this.isNew || this.isModified('name')) {
        ChipsetModel.find({ name: name }).exec((err, maps) => {
            cb(!err && maps.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Name already exists');

/// Document interface for more type-checking
export interface ChipsetDocument extends Document, ChipsetSchema {}

/// Model<T> exported for convenience.
export const ChipsetModel =
    model<ChipsetDocument>('ChipsetModel', mongooseChipsetSchema);
