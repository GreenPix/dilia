
export interface IsType<T> {
    new(...args: any[]): T;
}

export interface Any {}

export interface IsHighlightRules extends IsType<IsHighlightRules> {
    normalizeRules(): void;
    embedRules<T extends IsHighlightRules>(highlightRule: T, a: string, b: any[]): void;
}

export interface IsTextMode extends IsType<IsTextMode>, AceAjax.TextMode {
    foldingRules: any;
    $behaviour: any;
}

export interface TextUpdate {
    text: string;
    selection: any[];
}

export interface BehaviourAction {}

export interface BehaviourActionDel extends BehaviourAction {
    (this: any, state: string, action: string, editor: AceAjax.Editor,
     session: AceAjax.IEditSession, range: AceAjax.Range): TextUpdate | undefined;
}

export interface BehaviourActionIns extends BehaviourAction {
    (this: any, state: string, action: string, editor: AceAjax.Editor,
     session: AceAjax.IEditSession, text: string): AceAjax.Range | undefined;
}

export interface IsBehaviour extends IsType<IsBehaviour> {
    // This does not typecheck anything...
    add(name: string, mode: 'deletion', cb: BehaviourActionDel): void;
    add(name: string, mode: 'insertion', cb: BehaviourActionIns): void;
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
    stepBackward(): string[];
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
    openingBracketBlock(
        session: AceAjax.IEditSession, bracket: string, row: number, column: number, typeRe?: RegExp
    ): AceAjax.Range;
}
