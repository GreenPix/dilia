import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';

import {FileManager} from '../models/scripting';

import {RuleEditor} from './aariba/editor';
import {RuleEditorGlobals} from './aariba/globals';
import {RuleEditorExec} from './aariba/exec';


@NgModule({
    imports: [SharedModule],
    declarations: [
        RuleEditor,
        RuleEditorGlobals,
        RuleEditorExec,
    ],
    providers: [
        FileManager,
    ],
    exports: [
        RuleEditor,
    ],
})
export class AaribaModule {}
