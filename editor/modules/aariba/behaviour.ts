// Adapted version for AaribaScript of:
//
//      https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/behaviour/cstyle.js
//

import {IsType, IsBehaviour, IsTokenIterator, TextUpdate} from './interfaces';

/* tslint:disable:no-unused-variable */
let Behaviour: IsType<IsBehaviour> = ace.require('ace/mode/behaviour').Behaviour;
/* tslint:enable:no-unused-variable */
let TokenIterator: IsType<IsTokenIterator> = ace.require('ace/token_iterator').TokenIterator;
let lang = ace.require('ace/lib/lang');

let SAFE_INSERT_IN_TOKENS =
    ['text', 'paren.rparen', 'punctuation.operator'];
let SAFE_INSERT_BEFORE_TOKENS =
    ['text', 'paren.rparen', 'punctuation.operator', 'comment'];

// The context state is strange:
// Writing '{\n' and then removing
// everything except the '{' and then adding again a '\n'
// does not behave identically. Furthermore, I think we should
// match the brackets. (Lookup for the next possible bracket).
let context;
let contextCache: any = {};

function initContext(editor: AceAjax.Editor) {
    let id = -1;
    if (editor.multiSelect) {
        id = editor.selection.index;
        if (contextCache.rangeCount != editor.multiSelect.rangeCount)
            contextCache = {rangeCount: editor.multiSelect.rangeCount};
    }
    if (contextCache[id])
        return context = contextCache[id];
    context = contextCache[id] = {
        autoInsertedBrackets: 0,
        autoInsertedRow: -1,
        autoInsertedLineEnd: '',
        maybeInsertedBrackets: 0,
        maybeInsertedRow: -1,
        maybeInsertedLineStart: '',
        maybeInsertedLineEnd: ''
    };
}

function getWrapped(selection, selected, opening, closing) {
    let rowDiff = selection.end.row - selection.start.row;
    return {
        text: opening + selected + closing,
        selection: [
                0,
                selection.start.column + 1,
                rowDiff,
                selection.end.column + (rowDiff ? 0 : 1)
            ]
    };
}

function on_insert_brace(
    this: any, // TODO: Improve typing for ace at some point
    _state: string,
    _action: 'deletion',
    editor: AceAjax.Editor,
    session: AceAjax.IEditSession,
    text: string): TextUpdate | undefined
{
    let cursor = editor.getCursorPosition();
    let line = session.doc.getLine(cursor.row);
    if (text == '{') {
        initContext(editor);
        let selection = editor.getSelectionRange();
        let selected = session.doc.getTextRange(selection);
        if (selected !== '' && selected !== '{' && editor.getWrapBehavioursEnabled()) {
            return getWrapped(selection, selected, '{', '}');
        } else if (AaribaBehaviour.isSaneInsertion(editor, session)) {
            if (/[\]\}\)]/.test(line[cursor.column]) || editor.inMultiSelectMode) {
                AaribaBehaviour.recordAutoInsert(editor, session, '}');
                return {
                    text: '{}',
                    selection: [1, 1]
                };
            } else {
                AaribaBehaviour.recordMaybeInsert(editor, session, '{');
                return {
                    text: '{',
                    selection: [1, 1]
                };
            }
        }
    } else if (text == '}') {
        initContext(editor);
        let rightChar = line.substring(cursor.column, cursor.column + 1);
        if (rightChar == '}') {
            let matching = session.$findOpeningBracket('}', {column: cursor.column + 1, row: cursor.row});
            if (matching !== null && AaribaBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                AaribaBehaviour.popAutoInsertedClosing();
                return {
                    text: '',
                    selection: [1, 1]
                };
            }
        }
    } else if (text == '\n' || text == '\r\n') {
        initContext(editor);
        let closing = '';
        let next_indent;
        if (AaribaBehaviour.isMaybeInsertedClosing(cursor, line)) {
            closing = lang.stringRepeat('}', context.maybeInsertedBrackets);
            AaribaBehaviour.clearMaybeInsertedClosing();
        }
        let rightChar = line.substring(cursor.column, cursor.column + 1);
        if (rightChar === '}') {
            let openBracePos = session.findMatchingBracket({row: cursor.row, column: cursor.column+1}, '}');
            if (!openBracePos)
                 return;
            next_indent = this.$getIndent(session.getLine(openBracePos.row));
        } else if (closing) {
            next_indent = this.$getIndent(line);
        } else {
            AaribaBehaviour.clearMaybeInsertedClosing();
            return;
        }
        let indent = next_indent + session.getTabString();

        return {
            text: '\n' + indent + '\n' + next_indent + closing,
            selection: [1, indent.length, 1, indent.length]
        };
    } else {
        AaribaBehaviour.clearMaybeInsertedClosing();
    }
}

function on_delete_brace(
    _state: string,
    _action: string,
    editor: AceAjax.Editor,
    session: AceAjax.IEditSession,
    range: AceAjax.Range): AceAjax.Range | undefined
{
    let selected = session.doc.getTextRange(range);
    if (!range.isMultiLine() && selected == '{') {
        initContext(editor);
        let line = session.doc.getLine(range.start.row);
        let rightChar = line.substring(range.end.column, range.end.column + 1);
        if (rightChar == '}') {
            range.end.column++;
            return range;
        } else {
            context.maybeInsertedBrackets--;
        }
    }
}

function on_insert_paren(
    _state: string,
    _action: string,
    editor: AceAjax.Editor,
    session: AceAjax.IEditSession,
    text: string): TextUpdate | undefined
{
    if (text == '(') {
        initContext(editor);
        let selection = editor.getSelectionRange();
        let selected = session.doc.getTextRange(selection);
        if (selected !== '' && editor.getWrapBehavioursEnabled()) {
            return getWrapped(selection, selected, '(', ')');
        } else if (AaribaBehaviour.isSaneInsertion(editor, session)) {
            AaribaBehaviour.recordAutoInsert(editor, session, ')');
            return {
                text: '()',
                selection: [1, 1]
            };
        }
    } else if (text == ')') {
        initContext(editor);
        let cursor = editor.getCursorPosition();
        let line = session.doc.getLine(cursor.row);
        let rightChar = line.substring(cursor.column, cursor.column + 1);
        if (rightChar == ')') {
            let matching = session.$findOpeningBracket(')', {column: cursor.column + 1, row: cursor.row});
            if (matching !== null && AaribaBehaviour.isAutoInsertedClosing(cursor, line, text)) {
                AaribaBehaviour.popAutoInsertedClosing();
                return {
                    text: '',
                    selection: [1, 1]
                };
            }
        }
    }
}

function on_delete_paren(
    _state: string,
    _action: string,
    editor: AceAjax.Editor,
    session: AceAjax.IEditSession,
    range: AceAjax.Range): AceAjax.Range | undefined
{
   let selected = session.doc.getTextRange(range);
   if (!range.isMultiLine() && selected == '(') {
       initContext(editor);
       let line = session.doc.getLine(range.start.row);
       let rightChar = line.substring(range.start.column + 1, range.start.column + 2);
       if (rightChar == ')') {
           range.end.column++;
           return range;
       }
   }
}

export class AaribaBehaviour extends Behaviour {

    constructor() {
        super();
        this.add('braces', 'insertion', on_insert_brace);
        this.add('braces', 'deletion', on_delete_brace);
        this.add('parens', 'insertion', on_insert_paren);
        this.add('parens', 'deletion', on_delete_paren);
    }

    static isSaneInsertion(editor, session) {
        let cursor = editor.getCursorPosition();
        let iterator = new TokenIterator(session, cursor.row, cursor.column);

        // Don't insert in the middle of a keyword/identifier/lexical
        if (!this.$matchTokenType(iterator.getCurrentToken() || 'text', SAFE_INSERT_IN_TOKENS)) {
            // Look ahead in case we're at the end of a token
            let iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
            if (!this.$matchTokenType(iterator2.getCurrentToken() || 'text', SAFE_INSERT_IN_TOKENS))
                return false;
        }

        // Only insert in front of whitespace/comments
        iterator.stepForward();
        return iterator.getCurrentTokenRow() !== cursor.row ||
            this.$matchTokenType(iterator.getCurrentToken() || 'text', SAFE_INSERT_BEFORE_TOKENS);
    }

    static $matchTokenType(token, types) {
        return types.indexOf(token.type || token) > -1;
    }

    static recordAutoInsert(editor, session, bracket) {
        let cursor = editor.getCursorPosition();
        let line = session.doc.getLine(cursor.row);
        // Reset previous state if text or context changed too much
        if (!this.isAutoInsertedClosing(cursor, line, context.autoInsertedLineEnd[0]))
            context.autoInsertedBrackets = 0;
        context.autoInsertedRow = cursor.row;
        context.autoInsertedLineEnd = bracket + line.substr(cursor.column);
        context.autoInsertedBrackets++;
    }

    static recordMaybeInsert(editor, session, bracket) {
        let cursor = editor.getCursorPosition();
        let line = session.doc.getLine(cursor.row);
        if (!this.isMaybeInsertedClosing(cursor, line))
            context.maybeInsertedBrackets = 0;
        context.maybeInsertedRow = cursor.row;
        context.maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
        context.maybeInsertedLineEnd = line.substr(cursor.column);
        context.maybeInsertedBrackets++;
    }

    static isAutoInsertedClosing(cursor, line, bracket) {
        return context.autoInsertedBrackets > 0 &&
            cursor.row === context.autoInsertedRow &&
            bracket === context.autoInsertedLineEnd[0] &&
            line.substr(cursor.column) === context.autoInsertedLineEnd;
    }

    static isMaybeInsertedClosing(cursor, line) {
        return context.maybeInsertedBrackets > 0 &&
            cursor.row === context.maybeInsertedRow &&
            line.substr(cursor.column) === context.maybeInsertedLineEnd &&
            line.substr(0, cursor.column) == context.maybeInsertedLineStart;
    }

    static popAutoInsertedClosing() {
        context.autoInsertedLineEnd = context.autoInsertedLineEnd.substr(1);
        context.autoInsertedBrackets--;
    }

    static clearMaybeInsertedClosing() {
        if (context) {
            context.maybeInsertedBrackets = 0;
            context.maybeInsertedRow = -1;
        }
    }
}
