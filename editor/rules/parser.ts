import _ = require('lodash');

let pegParser = require<any>('./parser.pegjs');

interface VariableStore {
    [name: string]: number;
}

export class AaribaInterpreter {

    private globals: VariableStore;

    constructor() {
        this.reset();
    }

    execute(content: string) {
        let globalsInit = _.clone(this.globals);
        let locals = pegParser.parse(content, this.globals);
        console.log(`Globals (before):`, globalsInit);
        console.log(`Globals (after): `, this.globals);
        console.log(`Locals:          `, locals);
    }

    reset() {
        // TODO: this should be initiliazed with
        // the same data that comes from the server for the autocompleter.
        this.globals = {
            'me.hp': 10,
            'me.xp': 0,
        };
    }
}
