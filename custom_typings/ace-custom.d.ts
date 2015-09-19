
declare module AceAjax {

    export interface IEditSession {

        setMode(mode: TextMode): void;
        getCommentFoldRange(row: number, column: number, direction: number): AceAjax.Range;
    }

}
