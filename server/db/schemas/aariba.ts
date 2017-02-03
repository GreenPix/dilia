import {Schema, model, Document, Types} from 'mongoose';
import _ = require('lodash');

/// Schema:
const mongooseAaribaScriptSchema = new Schema({
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
    revisions: Revision[];
    contributors: Types.ObjectId[];
}

type KeysOfAaribaScriptProperties = keyof AaribaScriptProperties;

export interface AaribaScriptJsmap {
    name: string;
    created_on: Date;
    content: string;
    revisions: Array<{
        author: Types.ObjectId;
        date: Date;
        comment: string;
    }>;
}

export interface AaribaScriptSchema extends AaribaScriptProperties {

    toJsmap(): AaribaScriptJsmap;
    getRevision(id: number): Revision;
    getLatest(): Revision;
    commitRevision(rev: Revision, cb: (err: any) => void): void;
}

// tslint:disable:only-arrow-functions

mongooseAaribaScriptSchema.path('revisions').validate(function (revisions: Revision[]) {
    return revisions.length;
}, 'Revisions cannot be empty');

mongooseAaribaScriptSchema.path('revisions').validate(function (revisions: Revision[], cb: Function) {
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

mongooseAaribaScriptSchema.path('name').validate(function (name: string) {
    return name.length;
}, 'Name cannot be empty');

mongooseAaribaScriptSchema.path('name').validate(function (name: string, cb: Function) {
    if (this.isNew || this.isModified('name')) {
        AaribaScript.find({ name }).exec((err, scripts) => {
            cb(!err && scripts.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Name already exists');

mongooseAaribaScriptSchema.method({

    toJsmap(): AaribaScriptJsmap {

        let self: AaribaScriptSchema = this;
        let res: AaribaScriptJsmap =  _.pick<any, AaribaScriptSchema>(self,
            ['name', 'created_on'] as KeysOfAaribaScriptProperties[]
        );

        res.content = self.revisions[self.revisions.length - 1].content;
        res.revisions = self.revisions.map(r => {
            return {
                author: r.author,
                date: r.date,
                comment: r.comment,
            };
        });

        return res;
    },

    getLatest(): any {
        let self: AaribaScriptSchema = this;
        let id = self.revisions.length - 1;
        return _.pick(
            self.revisions[id],
            ['author', 'content', 'comment', 'created_on'] as KeysOfAaribaScriptProperties[]
        );
    },

    getRevision(id: number): any {
        let self: AaribaScriptSchema = this;
        return _.pick(
            self.revisions[id],
            ['author', 'content', 'comment', 'created_on'] as KeysOfAaribaScriptProperties[]
        );
    },

    commitRevision(rev: Revision, cb: (err: any) => void): void {
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
export interface AaribaScriptDocument extends Document, AaribaScriptSchema {
    id: string;
}

/// Model<T> exported for convenience.
export const AaribaScript =
    model<AaribaScriptDocument>('AaribaScript', mongooseAaribaScriptSchema);
