import {Schema, model, Document, Types} from 'mongoose';
import {MapJsmap} from '../../shared';
import {pick, find} from 'lodash';

// A layer where all tiles ids share the same
// chipset.
const mongooseLayerSchema = new Schema({
    tile_ids: Buffer,
    chipset: Schema.Types.ObjectId,
    depth: Number,
});

const mongooseMapSchema = new Schema({
    name: { type: String, maxlength: [
        30,
        'Name (`{VALUE}`) exceeds the ' +
        'maximum allowed length ({MAXLENGTH}).'
    ]},
    preview: { type: Buffer },
    width: { type: Number },
    height: { type: Number },
    tile_size: { type: Number },
    created_on: { type: Date, default: Date.now },
    revisions: [{
        author: Schema.Types.ObjectId,
        comment: { type: String, maxlength: [
            60,
            'Comment (`{VALUE}`) exceeds the ' +
            'maximum allowed length ({MAXLENGTH}).'
        ] },
        layers: [mongooseLayerSchema],
        date: { type: Date, default: Date.now },
    }],
    contributors: [Schema.Types.ObjectId],
});

export interface Layer {
    tile_ids: Buffer;
    chipset: Types.ObjectId;
    depth: number;
}

export interface Revision {
    author: Types.ObjectId;
    comment: string;
    // Specifies which ones are the 'real' layers
    // having a specific depth.
    layers: Layer[];
    date?: Date;
}

export interface RevisionWithPreview extends Revision {
    preview: Buffer;
}

export interface MapProperties {
    name: string;
    width: number;
    height: number;
    tile_size: number;
    preview: Buffer;
    created_on?: Date;
    revisions: Revision[];
    contributors: Types.ObjectId[];
}

type KeysOfMapProperties = keyof MapProperties;

export interface MapSchema extends MapProperties {

    toJsmap(): MapJsmap;
    getRevision(id: number): Revision;
    getLatest(): Revision;
    commitRevision(rev: RevisionWithPreview, cb: (err: any) => void): void;
}

// TODO: To convert between a Buffer and an Uint16Array:
//
//  Super fast way:
//
//      const arr = new Uint16Array(2);
//      arr[0] = 5000;
//      arr[1] = 4000;
//
//      const buf1 = new Buffer(arr); // copies the buffer
//      const buf2 = new Buffer(arr.buffer); // shares the memory with arr;
//
//      console.log(buf1);
//      // Prints: <Buffer 88 a0>, copied buffer has only two elements
//      console.log(buf2);
//      // Prints: <Buffer 88 13 a0 0f>
//
// To have a view:
//
//      const buf = new Buffer(arr.buffer).slice(0, 1);
//
// From buffer:
//
//      const g = new Uint16Array(buf.byteLength / 2);
//      for (let i = 0; i < buf.byteLength / 2; ++i) {
//          // Is LE platform dependent?
//          g[i] = buf.readUInt16LE(i * 2);
//      }
//
// We should probably stick with Buffer within node.
// And we can encode to string with:
//
//      buf.toString('base64')
//
//
mongooseMapSchema.method({

    toJsmap(): MapJsmap {

        let self: MapDocument = this;
        let res: MapJsmap =  pick<any, MapSchema>(self,
            ['name', 'created_on', 'width', 'height', 'tile_size'] as KeysOfMapProperties[]
        );

        let partial_layers_base64: Array<{ tiles_ids: string, chipset: string }> = [];
        let layers_base64 = [partial_layers_base64];
        let current_depth: number = 0;

        for (let layer of self.revisions[self.revisions.length - 1].layers) {
            if (current_depth < layer.depth) {
                partial_layers_base64 = [];
                layers_base64.push(partial_layers_base64);
                current_depth = layer.depth;
            }
            let semi_serialized_layer = {
                tiles_ids: layer.tile_ids.toString('base64'),
                chipset: layer.chipset.toHexString()
            };
            partial_layers_base64.push(semi_serialized_layer);
        }

        res.layers = layers_base64;
        res.revisions = self.revisions.map(r => {
            return {
                author: r.author.toHexString(),
                date: r.date.toUTCString(),
                comment: r.comment,
            };
        });
        res.id = self._id.toHexString();

        return res;
    },

    getLatest(): any {
        let self: MapDocument = this;
        let id = self.revisions.length - 1;
        return pick(self.revisions[id], ['author', 'layers', 'comment', 'date']);
    },

    getRevision(id: number): any {
        let self: MapDocument = this;
        return pick(self.revisions[id], ['author', 'layers', 'comment', 'date']);
    },

    commitRevision(rev: RevisionWithPreview, cb: (err: any) => void): void {
        let self: MapDocument = this;
        // Make sure the order is correct.
        rev.layers.sort((a, b) => a.depth - b.depth);
        // Push the new revision.
        self.revisions.push(rev);
        if (!find(self.contributors, contrib => contrib.equals(rev.author))) {
            self.contributors.push(rev.author);
        }
        self.preview = rev.preview;
        self.save(cb);
    }
});

// tslint:disable:only-arrow-functions

mongooseMapSchema.path('revisions').validate(function (revisions: Revision[]) {
    return revisions.length;
}, 'Revisions cannot be empty');

mongooseMapSchema.path('revisions').validate(function (revisions: Revision[], cb: Function) {
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

mongooseMapSchema.path('name').validate(function (name: string) {
    return name.length;
}, 'Name cannot be empty');

mongooseMapSchema.path('name').validate(function (name: string, cb: Function) {
    if (this.isNew || this.isModified('name')) {
        MapModel.find({ name }).exec((err, maps) => {
            cb(!err && maps.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Name already exists');

mongooseMapSchema.path('width').validate(function (width: number) {
    return width > 0;
}, 'Width must be strictly positive');

mongooseMapSchema.path('height').validate(function (height: number) {
    return height > 0;
}, 'Width must be strictly positive');

mongooseMapSchema.path('tile_size').validate(function (tile_size: number) {
    return tile_size > 0;
}, 'Tile size must be strictly positive');

/// Document interface for more type-checking
export interface MapDocument extends Document, MapSchema {
    id: string;
}

/// Model<T> exported for convenience.
export const MapModel = model<MapDocument>('MapModel', mongooseMapSchema);
