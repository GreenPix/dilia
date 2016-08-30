import {TestBed} from '@angular/core/testing';
import {provideRoutes} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {PROVIDERS} from './mocks';

import {App} from '../editor/app';
import {routes} from '../editor/routes';
import {MapModule} from '../editor/modules/map.module';
import {AaribaModule} from '../editor/modules/aariba.module';
import {ProfileModule} from '../editor/modules/profile.module';


describe('App', () => {

    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            RouterTestingModule,
            ProfileModule,
            AaribaModule,
            MapModule,
        ],
        declarations: [App],
        providers: [
            ...PROVIDERS,
            provideRoutes(routes)
        ]
    }));

    it('should also be able to test', () => {
        expect(true).toBe(true);
    });

    it('should have a router', () => {
        let app = TestBed.createComponent(App);
        app.detectChanges();
        expect(app.debugElement.componentInstance.router).toBeDefined();
    });
});
