import {Schema, model, Document} from 'mongoose';

/// Schemas:
let mongooseAaribaScriptSchema = new Schema({
    name: String,
    created_on: { type: Date, default: Date.now },
    content: String,
    contributors: [Schema.Types.ObjectId]
});

/// Schemas (Typescript equivalent)
export interface AaribaScriptSchema {
    name: string;
    created_on: Date;
    content: string;
}

/// Document interface for more type-checking
interface AaribaScriptDocument extends Document, AaribaScriptSchema {}

/// Model<T> exported for convenience.
export var AaribaScript =
    model<AaribaScriptDocument>('AaribaScript', mongooseAaribaScriptSchema);
