let pegParser = require<any>('./parser.pegjs');

interface VariableStore {
    [name: string]: number;
}

export interface AaribaLocation {
    column: number;
    line: number;
    offset: number;
}

export interface AaribaScriptError {
    location: {
        start: AaribaLocation,
        end: AaribaLocation,
    };
    message: string;
    name: string;
}

export class AaribaInterpreter {

    private globals: VariableStore;

    constructor() {
        this.reset();
    }

    execute(content: string) {
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
