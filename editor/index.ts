import {enableProdMode} from '@angular/core';
import {disableDebugTools} from '@angular/platform-browser';

if (IS_PRODUCTION) {
    disableDebugTools();
    enableProdMode();
}

import {HTTP_PROVIDERS} from '@angular/http';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {provideRouter} from '@angular/router';
import {provide} from '@angular/core';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {UniqueId, HttpService, SocketIOService} from './services/index';
import {App} from './app';
import {User, AaribaScriptSettings} from './models/user';
import {FileManager} from './models/scripting';
import {MapManager} from './models/map';
import {MapEditor} from './components/map/editor';
import {LoginForm} from './components/login/form';
import {RuleEditor} from './components/rules/editor';
import {Profile} from './components/profile/profile';
import {AuthGuard} from './permissions/auth';
import {AuthService} from './services/auth';

bootstrap(App, [
    HTTP_PROVIDERS,
    provideRouter([
        { path: 'login', component: LoginForm },
        { path: 'map-editor', component: MapEditor, canActivate: [AuthGuard] },
        { path: 'script-editor', component: RuleEditor, canActivate: [AuthGuard] },
        { path: 'profile', component: Profile, canActivate: [AuthGuard] },
        { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]),
    AuthService,
    AuthGuard,
    HttpService,
    SocketIOService,
    FileManager,
    MapManager,
    provide(User, { useValue: User.default() }),
    provide(AaribaScriptSettings, { useFactory: user => user.aaribaScriptSettings, deps: [User] }),
    provide(UniqueId, { useFactory: () => new UniqueId() }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
])
.catch(err => console.error(err));
