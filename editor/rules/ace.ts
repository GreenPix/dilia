import {IsHighlightRules, IsTextMode} from '../util/interfaces';

let TextMode: IsTextMode = ace.require("ace/mode/text").Mode;
let TextHighlightRules: IsHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;

export class RuleScriptHighlightRules extends TextHighlightRules
{

    constructor() {
        super();
        // this.$rules = {
        //     start:
        // };
        console.log(this);
    }
}

export class RuleScriptTextMode extends TextMode
{

    HighlightRules = RuleScriptHighlightRules;

    constructor() {
        super();
    }
}
