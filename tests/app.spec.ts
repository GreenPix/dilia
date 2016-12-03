import {TestBed} from '@angular/core/testing';
import {NgModule, Component, Type} from '@angular/core';
import {provideRoutes} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {PROVIDERS} from './mocks';

import {App} from '../editor/app';
import {routes} from '../editor/routes';
import {MapModule} from '../editor/modules/map.module';
import {AaribaModule} from '../editor/modules/aariba.module';
import {ProfileModule} from '../editor/modules/profile.module';
import {RunnerModule} from '../editor/modules/runner.module';
import {SharedModule} from '../editor/components/shared.module';

// Override all components
[AaribaModule, RunnerModule, ProfileModule, MapModule, SharedModule].forEach(module => {
    let annot: NgModule = Reflect.getOwnMetadata('annotations', module)[0];
    for (let component of (annot.declarations as Type<any>[])) {
        let comp: Component = Reflect.getOwnMetadata('annotations', component)[0];
        if (comp.templateUrl !== undefined) {
            comp.template = comp.templateUrl;
            comp.templateUrl = undefined;
        }
    }
});


describe('App', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule,
                ProfileModule,
                AaribaModule,
                RunnerModule,
                MapModule,
                SharedModule,
            ],
            declarations: [App],
            providers: [
                ...PROVIDERS,
                provideRoutes(routes)
            ]
        });
        let comp: Component = Reflect.getOwnMetadata('annotations', App)[0];
        TestBed.overrideComponent(App, {set: {template: comp.templateUrl, templateUrl: undefined}});
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });

    it('should also be able to test', () => {
        expect(true).toBe(true);
    });

    it('should have a router', (done) => {
        TestBed.compileComponents().then(() => {
            let app = TestBed.createComponent(App);
            app.detectChanges();
            expect(app.debugElement.componentInstance.router).toBeDefined();
            done();
        });
    });
});
