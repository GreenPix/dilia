import {Component, View} from 'angular2/core';
import {CanActivate} from 'angular2/router';

let mapEditorTemplate = require<string>('./editor.html');

@Component({
    selector: 'map-editor',
})
@View({
    templateUrl: mapEditorTemplate
})
@CanActivate(() => false)
export class MapEditor {

}
