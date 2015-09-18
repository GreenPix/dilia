
export interface IsType<T> {
    new(...args: any[]): T;
}

export interface IsHighlightRules extends IsType<IsHighlightRules> {}
export interface IsTextMode extends IsType<IsTextMode>, AceAjax.TextMode {}
