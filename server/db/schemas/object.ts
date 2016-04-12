import {Schema, model, Document, Types} from 'mongoose';

let maxlenStr = [
    30,
    'Name (`{VALUE}`) exceeds the ' +
    'maximum allowed length ({MAXLENGTH}).'
];

enum ObjectKind {
    Simple,
    Layer
}

type Bounds = [number, number, number, number];

// Several kinds of objects exists:
//
//  * Simple objects:
//
//    They are just a view in a chipset.
//
let mongooseSimpleObjectSchema = new Schema({
    name: { type: String, maxlength: maxlenStr},
    created: { type: Date, default: Date.now },
    bounds: [Number],
    chipset: Schema.Types.ObjectId
});

export interface SimpleObjectProps {
    name: string;
    created: Date;
    bounds: Bounds;
    chipset: Types.ObjectId;
}
//
//  * LocalLayer objects:
//
//    Such object offers more than one layer
//    where each layer can be either a view in a
//    chipset or a list of tiles (the former
//    can be seen as a storage optimization thing,
//    so we will more likely store simply a list
//    of tiles).
//
let mongooseLayerObjectSchema = new Schema({
    name: { type: String, maxlength: maxlenStr },
    created: { type: Date, default: Date.now },
    width: Number,
    height: Number,
    tile_size: Number,
    layers: [{
        // All tiles shares the same chipset.
        // TODO: Is it okay?
        chipset: Schema.Types.ObjectId,
        tiles: [{
            bounds: [Number],
        }]
    }]
});

export interface LayerObjectProps {
    name: string;
    created: Date;
    width: number;
    height: number;
    tile_size: number;
    layers: Array<{
        chipset: Types.ObjectId;
        tiles: Array<{ bounds: Bounds }>;
    }>;
}
//
//  * Hierarchical objects:
//
//    A hierarchical object is defined using
//    other objects (LocalLayer or Simple) and
//    parent-child relationships are used to
//    define the rendering order.
let mongooseHiearchicalObject = new Schema({
    name: { type: String, maxlength: maxlenStr },
    created: { type: Date, default: Date.now },
    tree: [{
        object_id: Schema.Types.ObjectId,
        object_kind: Number,
        children: [Number],
    }]
});
export interface HierarchicalObjectProps {
    name: string;
    created: Date;
    tree: Array<{
        object_id: Types.ObjectId;
        object_kind: ObjectKind;
        children: number[];
    }>;
}
// How are we going to store problematic stuff?
// like the cleaves?

// Everything described above is really
// about rendering. How do we cope with collisions?
//
// For the cleaves case, we can

// Ideally, an object could be constructed using
// other objects. However this lead to two
// possibilites:
//
//  - When the upstream object change, the
//    downstream ones needs to be updated.
//
//  - When an object is used in another object
//    we just replace the tiles by the one used
//    by this object. This has the main drawback
//    that the object couldn't be removed later.
//
// Also we want to keep revisions of an object,
// however this can have an overhead if we have
// too many revisions. Especially, if we don't
// have a delta mechanism.
//
// When editing an object, the editor will
// need to know:
//
let mongooseObjectSchema = new Schema({
    name: { type: String, maxlength: [
        30,
        'Object name (`{VALUE}`) is too long, exceed' +
        ' maximum length (`{MAXLENGTH}`)'
    ]},
    width: Number,
    // Size of the object
    height: Number,
    // A rendered version of the Object.
    rendered_version: Buffer,
    revisions: [{
        author: Schema.Types.ObjectId,
        date: { type: Date, default: Date.now },
        tiles: [{
            // Always 4: top left corner
            bounds: [Number],
            chipset: Schema.Types.ObjectId,
        }]
    }],
    contributors: [Schema.Types.ObjectId],
});
