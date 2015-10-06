
declare module AceAjax {


    export interface Editor {
        multiSelect: { rangeCount: number; };
    }

    export interface Selection {
        index: number;
    }

    export interface IEditSession {

        setMode(mode: TextMode): void;
        getCommentFoldRange(row: number, column: number, direction: number): AceAjax.Range;

        findMatchingBracket(position: Position, bracket?: string);

        $findOpeningBracket(bracket: '(', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: ')', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: '[', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: ']', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: '{', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: '}', position: Position, typeRe?: RegExp): Position;
        $findOpeningBracket(bracket: string, position: Position, typeRe?: RegExp): Position;
    }

}
