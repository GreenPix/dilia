import {Component} from 'angular2/core';

let execTemplate = require<string>('./exec.html');
let execCss = require<string>('./exec.css');

@Component({
    selector: 'rule-editor-exec',
    styles: [execCss],
    directives: [],
    templateUrl: execTemplate,
})
export class RuleEditorExec {

}
