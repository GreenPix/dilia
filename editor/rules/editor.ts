
import {Component, View} from 'angular2/angular2';

let ruleEditorTemplate = require<string>('./editor.html');

@Component({
  selector: 'rule-editor'
})
@View({
  templateUrl: ruleEditorTemplate
})
export class RuleEditor {
  
}
