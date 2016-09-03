import {Component} from '@angular/core';

let execTemplate = require<string>('./exec.html');
let execCss = require<string>('./exec.css');

@Component({
    selector: 'rule-editor-exec',
    styles: [execCss],
    templateUrl: execTemplate,
})
export class RuleEditorExec {

}
