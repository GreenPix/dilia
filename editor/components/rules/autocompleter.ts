import {map} from 'lodash';

// TODO: This should be gathered from the server.
let globals = {
    '$me.hp': {
        'doc': 'Health points'
    },
    '$me.xp': {
        'doc': 'Experience point'
    }
};

export class AaribaScriptCompleter {

    // TODO: collect local variables and propose completion for them
    getCompletions(editor, session, pos, prefix, callback) {
        if (prefix.length === 0) { callback(null, []); return; }
        callback(null, map(globals, (val: any, key) => {
            return {
                value: key,     // value inserted.
                caption: key,   // text displayed.
                meta: val.doc,  // associated comment for the value.
                score: 1,       // Score.
            };
        }));
    }
}
