import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';

import {AlertBox} from './alert/box';
import {AutocompleteFiles} from './autocomplete/autocomplete';
import {LoginForm} from './login/form';
import {Dialog, DialogHeader, DialogFooter, DialogBody} from './modal/dialog';
import {Toolbar} from './toolbar/toolbar';
import {CommitModal} from './commit';
import {WebGLSurface} from './webgl/surface';
import {WebGLSingleTextureSurface} from './webgl/simple-surface';
import {Upload} from './upload/upload';
import {SelectEl, AnimFadeIn} from '../services/directives';
import {HttpService} from '../services';

@NgModule({
    imports: [CommonModule, FormsModule, RouterModule],
    declarations: [
        AlertBox,
        AutocompleteFiles,
        LoginForm,
        Dialog,
        DialogHeader,
        DialogFooter,
        DialogBody,
        Toolbar,
        CommitModal,
        WebGLSurface,
        WebGLSingleTextureSurface,
        Upload,
        SelectEl,
        AnimFadeIn,
    ],
    providers: [
        HttpService,
    ],
    exports: [
        CommonModule, FormsModule, HttpModule,
        AlertBox,
        AutocompleteFiles,
        LoginForm,
        Dialog,
        DialogHeader,
        DialogFooter,
        DialogBody,
        Toolbar,
        CommitModal,
        WebGLSurface,
        WebGLSingleTextureSurface,
        Upload,
        SelectEl,
        AnimFadeIn,
    ],
})
export class SharedModule {}
