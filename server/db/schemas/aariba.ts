import {Schema, model, Document, Types} from 'mongoose';
import _ = require('lodash');

/// Schema:
let mongooseAaribaScriptSchema = new Schema({
    name: { type : String, maxlength: [
        30,
        'Name (`{VALUE}`) exceeds the ' +
        'maximum allowed length ({MAXLENGTH}).'
    ] },
    created_on: { type: Date, default: Date.now },
    revisions: [{
        author: Schema.Types.ObjectId,
        comment: { type: String, maxlength: [
            60,
            'Comment (`{VALUE}`) exceeds the ' +
            'maximum allowed length ({MAXLENGTH}).'
        ] },
        content: String,
        date: { type: Date, default: Date.now },
    }],
    contributors: [Schema.Types.ObjectId],
});

export interface Revision {
    author: Types.ObjectId;
    content: string;
    comment: string;
    date?: Date;
}

/// Schema (Typescript equivalent)
export interface AaribaScriptProperties {
    name: string;
    created_on?: Date;
    revisions: Array<Revision>;
    contributors: Types.ObjectId[];
}

export interface AaribaScriptSchema extends AaribaScriptProperties {
    // Form usefull for the client
    toJsonResponse(): any;
    getRevision(id: number): any;
    commitRevision(rev: Revision, cb: (err: any) => void): void;
}

mongooseAaribaScriptSchema.path('revisions').validate(function (revisions: Array<Revision>) {
    return revisions.length;
}, 'Revisions cannot be empty');

mongooseAaribaScriptSchema.path('revisions').validate(function (revisions: Array<Revision>, cb) {
    if (this.isNew || this.isModified('revisions')) {
        for (let rev of revisions) {
            if (!rev.comment || !rev.comment.length) {
                cb(false);
                return;
            }
        }
    }
    cb(true);
}, 'Each revision must contains a non-empty comment');

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

    toJsonResponse: function (): any {

        let self: AaribaScriptSchema = this;
        let res =  _.pick<any, AaribaScriptSchema>(self,
            ['name', 'created_on']
        );

        res.content = self.revisions[0].content;
        res.revisions = self.revisions.map(r => {
            return {
                author: r.author,
                date: r.date,
                comment: r.comment,
            };
        });

        return res;
    },

    getRevision: function (id: number): any {
        let self: AaribaScriptSchema = this;
        return _.pick(self.revisions[id], ['author', 'content', 'comment', 'date']);
    },

    commitRevision: function (rev: Revision, cb: (err: any) => void): void {
        let self: AaribaScriptDocument = this;
        self.revisions.push({
            author: rev.author,
            comment: rev.comment,
            content: rev.content,
        });
        if (!_.find(self.contributors, contrib => contrib.equals(rev.author))) {
            self.contributors.push(rev.author);
        }
        self.save(cb);
    }
});

/// Document interface for more type-checking
export interface AaribaScriptDocument extends Document, AaribaScriptSchema {}

/// Model<T> exported for convenience.
export var AaribaScript =
    model<AaribaScriptDocument>('AaribaScript', mongooseAaribaScriptSchema);
