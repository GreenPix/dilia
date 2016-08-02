let pegParser = require<any>('./parser.pegjs');

interface VariableStore {
    [name: string]: number;
}

export interface AaribaScriptError {
    column: number;
    line: number;
    offset: number;
    message: string;
    name: string;
}

export class AaribaInterpreter {

    private globals: VariableStore;

    constructor() {
        this.reset();
    }

    execute(content: string) {
        //let globalsInit = clone(this.globals);
        pegParser.parse(content, this.globals);
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
