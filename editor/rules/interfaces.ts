
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
}

export interface AceFoldMode {

    getFoldWidget(session: AceAjax.IEditSession, foldStyle: string, row: number): string;
    indentationBlock(session: AceAjax.IEditSession, row: number, col: number): AceAjax.Range;
    closingBracketBlock(session: AceAjax.IEditSession, bracket: string, row: number, column: number): AceAjax.Range;
    openingBracketBlock(session: AceAjax.IEditSession, bracket: string, row: number, column: number, typeRe?: RegExp): AceAjax.Range;
}
