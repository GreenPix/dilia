
export interface IsType<T> {
    new(...args: any[]): T;
}

export interface Any {}

export interface IsHighlightRules extends IsType<IsHighlightRules> {
    normalizeRules(): void;
    embedRules<T extends IsHighlightRules>(highlightRule: T, a: string, b: any[]);
}

export interface IsTextMode extends IsType<IsTextMode>, AceAjax.TextMode {
    foldingRules: any;
    $behaviour: any;
}

export interface TextUpdate {
    text: string;
    selection: any[];
}

export interface BehaviourAction {
    (state: string, action: 'insertion', editor: AceAjax.Editor,
     session: AceAjax.IEditSession, range: AceAjax.Range): TextUpdate;
    (state: string, action: 'deletion', editor: AceAjax.Editor,
     session: AceAjax.IEditSession, text: string): AceAjax.Range;
    (state: string, action: string, editor: AceAjax.Editor,
     session: AceAjax.IEditSession, range_or_text: AceAjax.Range | string): any;
}

export interface IsBehaviour extends IsType<IsBehaviour> {
    add(name: string, mode: string, cb: BehaviourAction): void;
    addBehaviours(behaviours: any): void;
    remove(name: string): void;
    getBehaviours(filter: any): any;
}

export interface IsTokenIterator extends IsType<IsTokenIterator> {
    $session: AceAjax.IEditSession;
    $row: number;
    $rowTokens: any;
    $tokenIndex: number;
    stepBackward(): Array<string>;
    stepForward(): string;
    getCurrentToken(): string;
    getCurrentTokenRow(): number;
    getCurrentTokenColumn(): number;
    getCurrentTokenPosition(): AceAjax.Position;
}

export interface AceFoldMode {

    getFoldWidget(session: AceAjax.IEditSession, foldStyle: string, row: number): string;
    indentationBlock(session: AceAjax.IEditSession, row: number, col: number): AceAjax.Range;
    closingBracketBlock(session: AceAjax.IEditSession, bracket: string, row: number, column: number): AceAjax.Range;
    openingBracketBlock(session: AceAjax.IEditSession, bracket: string, row: number, column: number, typeRe?: RegExp): AceAjax.Range;
}
