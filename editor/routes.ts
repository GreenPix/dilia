import {Route} from '@angular/router';

import {MapEditor} from './components/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './components/rules/editor';
import {Profile} from './components/profile/profile';
import {AuthGuard} from './permissions/auth';


export const routes: Route[] = [
    { path: 'login', component: LoginForm },
    { path: 'map-editor', component: MapEditor, canActivate: [AuthGuard] },
    { path: 'script-editor', component: RuleEditor, canActivate: [AuthGuard] },
    { path: 'profile', component: Profile, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
];
