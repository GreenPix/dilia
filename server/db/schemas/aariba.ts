import {Schema, model, Document, Types} from 'mongoose';
import {User} from './users';
import _ = require('lodash');

/// Schema:
let mongooseAaribaScriptSchema = new Schema({
    name: String,
    created_on: { type: Date, default: Date.now },
    content: String,
    contributors: [Schema.Types.ObjectId],
    locked_by: Schema.Types.ObjectId,
});

/// Schema (Typescript equivalent)
export interface AaribaScriptSchema {
    name: string;
    created_on: Date;
    content: string;
    contributors: Types.ObjectId[];
    locked_by: Types.ObjectId;

    // Form usefull for the client
    toJsonResponse(): string;
}


mongooseAaribaScriptSchema.path('name').validate(function (name) {
    return name.length;
}, 'Name cannot be empty')

mongooseAaribaScriptSchema.path('name').validate(function (name, cb) {
    if (this.isNew || this.isModified('name')) {
        AaribaScript.find({ name: name }).exec((err, scripts) => {
            cb(!err && scripts.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Name already exists');

mongooseAaribaScriptSchema.method({
    toJsonResponse: function (): string {
        return _.pick<any, AaribaScriptSchema>(this,
            ['name', 'content', 'created_on']
        );
    }
});

/// Document interface for more type-checking
export interface AaribaScriptDocument extends Document, AaribaScriptSchema {}

/// Model<T> exported for convenience.
export var AaribaScript =
    model<AaribaScriptDocument>('AaribaScript', mongooseAaribaScriptSchema);
