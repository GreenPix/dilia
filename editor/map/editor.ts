import {Component, View} from 'angular2/angular2';
import {CanActivate} from 'angular2/router';
import LoggedInService = require('../services/LoggedInService');

let mapEditorTemplate = require<string>('./editor.html');

@Component({
    selector: 'map-editor',
})
@View({
    templateUrl: mapEditorTemplate
})
// @CanActivate(() => , )
export class MapEditor {
}
