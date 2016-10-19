import {Schema, model, Document, Model, Types} from 'mongoose';
import crypto = require('crypto');

let mongooseUserSchema = new Schema({
    username: { type: String, default: ''},
    email: { type: String, default: '' },
    provider: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    authToken: { type: String, default: '' },
    github: {},
    google: {},
    lastUsedResources: {
        type: [{ assocSchema: String, id: Schema.Types.ObjectId }],
        default: [],
    },
});

export interface UserSchema {
    username: string;
    email: string;
    provider: string;
    hashed_password?: string;
    salt?: string;
    authToken?: string;
    google?: any;
    github?: any;
    lastUsedResources: Array<{ assocSchema: string; id: Types.ObjectId }>;

    // Need to be in sync with 'method' call
    authenticate(password: string): boolean;
}


/**
 * Virtuals
 */
mongooseUserSchema.virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () { return this._password; });

/**
 * Validators for fields
 */
mongooseUserSchema.path('username').validate(function (username) {
    if (this.skipValidation()) return true;
    return username.length;
}, 'User name cannot be empty');

mongooseUserSchema.path('username').validate(function (username, cb) {
    if (this.skipValidation()) cb(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('username')) {
        User.find({ username: username }).exec((err, users) => {
            cb(!err && users.length === 0);
        });
    } else {
        cb(true);
    }
}, 'User name already exists');

mongooseUserSchema.path('email').validate(function (email) {
    if (this.skipValidation()) return true;
    return email.length;
}, 'Email cannot be empty');

mongooseUserSchema.path('email').validate(function (email, cb) {
    if (this.skipValidation()) cb(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.find({ email: email }).exec(function (err, users) {
            cb(!err && users.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Email already exists');

mongooseUserSchema.path('hashed_password').validate(function (hashed_password) {
    if (this.skipValidation()) return true;
    return hashed_password.length && this._password.length;
}, 'Password cannot be empty');


mongooseUserSchema.pre('save', function (next) {
    if (!this.isNew) return next();

    if (this.skipValidation() || (this.password && this.password.length)) {
        next();
    } else {
        next(new Error('Invalid password'));
    }
});


mongooseUserSchema.method({

    authenticate: function (password: string): boolean {
        return this.encryptPassword(password) === this.hashed_password;
    },

    makeSalt: function (): string {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    encryptPassword: function (password: string): string {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },

    skipValidation: function(): boolean {
        // Validation is not required if using OAuth
        return this.provider === 'github' || this.provider === 'google';
    },
});

class AuthorMap {

    cache: { [index: string]: string };

    constructor() {
        this.cache = {};
    }

    get(author: Types.ObjectId): string {
        return this.cache[author.toHexString()];
    }
}

mongooseUserSchema.static('findAll', (authors: Types.ObjectId[], cb: (err:any, authors: AuthorMap) => void) => {

    User.find({
        _id: {
            $in: authors.map(a => a.toHexString())
        }
    }).select('username').exec((err, users) => {
        if (err) return cb(err, null);
        let authorMap = new AuthorMap();
        for (let user of users) {
            authorMap.cache[user.id] = user.username;
        }
        cb(null, authorMap);
    });
});

export interface UserDocument extends Document, UserSchema {
    id: string;
}
interface UserModel {
    findAll(authors: Types.ObjectId[], cb: (err: any, authors: AuthorMap) => void): void;
}

export var User = <Model<UserDocument> & UserModel>
    model<UserDocument>('UserSchema', mongooseUserSchema);
