import {IsHighlightRules, IsTextMode, IsType, AceFoldMode} from './interfaces';
import {AaribaScriptCompleter} from './autocompleter';
import {AaribaBehaviour} from './behaviour';
import {injectCss} from '../../util/injector';

/* tslint:disable:no-unused-variable */
let TextMode: IsTextMode = ace.require('ace/mode/text').Mode;
let TextHighlightRules: IsHighlightRules = ace.require('ace/mode/text_highlight_rules').TextHighlightRules;
let Range: IsType<AceAjax.Range> = ace.require('ace/range').Range;
let FoldMode: IsType<AceFoldMode> = ace.require('ace/mode/folding/fold_mode').FoldMode;
/* tslint:enable:no-unused-variable */

// Autocompletion configuration
let langTools = ace.require('ace/ext/language_tools');
langTools.setCompleters([]);
langTools.addCompleter(new AaribaScriptCompleter());

let aceCss = require<string>('./ace.css');


interface HighlightToken {
    token: string | string[] | Function;
    regex: string | RegExp;
    next?: string;
    caseInsensitive?: boolean;
}

interface HighlightRules {
    [index: string]: HighlightToken[];
}

class AaribaScriptHighlightRules extends TextHighlightRules {
    $rules: HighlightRules;

    constructor() {
        super();

        injectCss(aceCss);

        let identRe = /[a-zA-Z_\u00a1-\uffff][a-zA-Z\d\._\u00a1-\uffff]*/;
        let globalIdenRe = /\$[a-zA-Z\d\._\u00a1-\uffff]*/;
        let numericRe = /[-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?/;
        let funcRe = /sin|cos|max|min|rand\b/;

        // TODO: add support for comments
        this.$rules = {
            start: [
                { token: 'paren.lparen', regex : '[[({]' },
                { token: 'paren.rparen', regex : '[\\])}]' },
                { token: 'comment', regex: /\/\/.*$/ },
                { token: 'keyword.else', regex: /else/ },
                { token: 'keyword.if', regex: /if/, next: 'if_cond' },
                { token: 'keyword.function', regex: funcRe },
                { token: 'variable.global', regex: globalIdenRe },
                { token: 'variable.local', regex: identRe },
                { token: 'numeric', regex: numericRe },
            ],
            if_cond: [
                { token: 'variable.global', regex: globalIdenRe, next: 'start' },
            ],
        };

        this.normalizeRules();
    }
}

/**
 * This class is a modified form of:
 *
 *     https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/folding/cstyle.js
 *
 *  Copyright (c) 2010, Ajax.org B.V.
 */
class AaribaFoldMode extends FoldMode {

    foldingStartMarker: RegExp;
    foldingStopMarker: RegExp;
    singleLineBlockCommentRe: RegExp;
    tripleStarBlockCommentRe: RegExp;
    startRegionRe: RegExp;

    constructor() {
        super();
        this.foldingStartMarker = /(\{|\[)[^\}\]]*$|^\s*(\/\*)/;
        this.foldingStopMarker = /^[^\[\{]*(\}|\])|^[\s\*]*(\*\/)/;
        this.singleLineBlockCommentRe = /^\s*(\/\*).*\*\/\s*$/;
        this.tripleStarBlockCommentRe = /^\s*(\/\*\*\*).*\*\/\s*$/;
        this.startRegionRe = /^\s*(\/\*|\/\/)#?region\b/;
    }

    getFoldWidget(session: AceAjax.IEditSession, foldStyle: string, row: number): string {
        let line = session.getLine(row);

        if (this.singleLineBlockCommentRe.test(line)) {
            // No widget for single line block comment unless region or triple star
            if (!this.startRegionRe.test(line) && !this.tripleStarBlockCommentRe.test(line))
                return '';
        }

        let fw = super.getFoldWidget(session, foldStyle, row);

        if (!fw && this.startRegionRe.test(line))
            return 'start'; // lineCommentRegionStart

        return fw;
    }

    getFoldWidgetRange(
        session: AceAjax.IEditSession,
        foldStyle: string,
        row: number,
        forceMultiline?: boolean
    ): AceAjax.Range | undefined {

        let line = session.getLine(row);

        if (this.startRegionRe.test(line))
            return this.getCommentRegionBlock(session, line, row);

        let match = line.match(this.foldingStartMarker);
        if (match) {
            let i = match.index;

            if (match[1] && i)
                return this.openingBracketBlock(session, match[1], row, i);

            let range: AceAjax.Range | undefined =
                session.getCommentFoldRange(row, i + match[0].length, 1);

            if (range && !range.isMultiLine()) {
                if (forceMultiline) {
                    range = this.getSectionRange(session, row);
                } else if (foldStyle !== 'all')
                    range = undefined;
            }

            return range;
        }

        if (foldStyle === 'markbegin')
            return;

        match = line.match(this.foldingStopMarker);
        if (match) {
            let i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
        }
    }

    getSectionRange(session: AceAjax.IEditSession, row: number) {
        let line = session.getLine(row);
        let startIndent = line.search(/\S/);
        let startRow = row;
        let startColumn = line.length;
        row = row + 1;
        let endRow = row;
        let maxRow = session.getLength();
        while (++row < maxRow) {
            line = session.getLine(row);
            let indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            let subRange = this.getFoldWidgetRange(session, 'all', row);

            if (subRange) {
                if (subRange.start.row <= startRow) {
                    break;
                } else if (subRange.isMultiLine()) {
                    row = subRange.end.row;
                } else if (startIndent === indent) {
                    break;
                }
            }
            endRow = row;
        }

        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
    }

    getCommentRegionBlock(session: AceAjax.IEditSession, line: string, row: number) {
        let startColumn = line.search(/\s*$/);
        let maxRow = session.getLength();
        let startRow = row;

        let re = /^\s*(?:\/\*|\/\/|--)#?(end)?region\b/;
        let depth = 1;
        while (++row < maxRow) {
            line = session.getLine(row);
            let m = re.exec(line);
            if (!m) continue;
            if (m[1]) depth--;
            else depth++;

            if (!depth) break;
        }

        let endRow = row;
        if (endRow > startRow) {
            return new Range(startRow, startColumn, endRow, line.length);
        }
    }
}

export class AaribaScriptTextMode extends TextMode {

    HighlightRules = AaribaScriptHighlightRules;

    constructor() {
        super();
        this.foldingRules = new AaribaFoldMode();
        this.$behaviour = new AaribaBehaviour();
    }

    getNextLineIndent(state: any, line: any, tab: any): string {
        let indent = this.$getIndent(line);

        let tokenizedLine = this.getTokenizer().getLineTokens(line, state);
        let tokens = tokenizedLine.tokens;
        let endState = tokenizedLine.state;

        if (tokens.length && tokens[tokens.length - 1].type === 'comment') {
            return indent;
        }

        if (state === 'start' || state === 'no_regex') {
            let match = line.match(/^.*(?:\bcase\b.*\:|[\{\(\[])\s*$/);
            if (match) {
                indent += tab;
            }
        } else if (state === 'doc-start') {
            if (endState === 'start' || endState === 'no_regex') {
                return '';
            }
            let match = line.match(/^\s*(\/?)\*/);
            if (match) {
                if (match[1]) {
                    indent += ' ';
                }
                indent += '* ';
            }
        }

        return indent;
    };

    checkOutdent(line: any, input: any): boolean {
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\}/.test(input);
    }

    autoOutdent(_state: any, doc: any, row: any) {
        let line = doc.getLine(row);
        let match = line.match(/^(\s*\})/);

        if (!match) return 0;

        let column = match[1].length;
        let openBracePos = doc.findMatchingBracket({row, column});

        if (!openBracePos || openBracePos.row === row) return 0;

        let indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column - 1), indent);
    }

    $getIndent(line: any) {
        return line.match(/^\s*/)[0];
    }
}
