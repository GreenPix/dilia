import * as map from 'lodash/map';

// TODO: This should be gathered from the server.
let globals = {
    '$me.hp': {
        doc: 'Health points'
    },
    '$me.xp': {
        doc: 'Experience point'
    }
};

export class AaribaScriptCompleter {

    // TODO: collect local variables and propose completion for them
    getCompletions(_editor: any, _session: any, _pos: any, prefix: any, callback: any) {
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
