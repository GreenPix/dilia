import {addProviders, inject} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {PROVIDERS} from './mocks';

import {App} from '../editor/app';
import {routes} from '../editor/routes';


describe('App', () => {

    beforeEach(() => addProviders([
        provideRouter(routes),
        App,
        ...PROVIDERS,
    ]));

    it('should also be able to test', () => {
        expect(true).toBe(true);
    });

    it('should have a router', inject([App], (app: App) => {
        expect(app.router).toBeDefined();
    }));
});
