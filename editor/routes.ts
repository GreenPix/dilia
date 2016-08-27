import {Routes} from '@angular/router';

import {MapEditor} from './modules/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './modules/aariba/editor';
import {Profile} from './modules/profile/profile';
import {AuthGuard} from './permissions/auth';


export const routes: Routes = [
    { path: 'login', component: LoginForm },
    { path: 'map-editor', component: MapEditor, canActivate: [AuthGuard] },
    { path: 'script-editor', component: RuleEditor, canActivate: [AuthGuard] },
    { path: 'profile', component: Profile, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
