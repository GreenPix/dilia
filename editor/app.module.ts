import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {NgModule, provide} from '@angular/core';
import {RouterModule} from '@angular/router';
import {SharedModule} from './components/shared.module';
import {MapModule} from './modules/map.module';
import {AaribaModule} from './modules/aariba.module';
import {ProfileModule} from './modules/profile.module';

import {UniqueId, SocketIOService} from './services/index';
import {User, AaribaScriptSettings} from './models/user';
import {AuthGuard} from './permissions/auth';
import {AuthService} from './services/auth';

import {routes} from './routes';
import {App} from './app';


@NgModule({
    imports: [
        BrowserModule,
        SharedModule,
        ProfileModule,
        AaribaModule,
        MapModule,
        RouterModule.forRoot(routes)
    ],
    declarations: [
        App,
    ],
    providers: [
        AuthService,
        AuthGuard,
        SocketIOService,
        provide(User, { useValue: User.default() }),
        provide(AaribaScriptSettings, { useFactory: user => user.aaribaScriptSettings, deps: [User] }),
        provide(UniqueId, { useFactory: () => new UniqueId() }),
        provide(LocationStrategy, { useClass: HashLocationStrategy })
    ],
    bootstrap: [App]
})
export class AppModule {}
