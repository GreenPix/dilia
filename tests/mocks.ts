import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {Injectable} from '@angular/core';
import {XHRBackend} from '@angular/http';
import {MockBackend} from '@angular/http/testing';
import {AuthGuard} from '../editor/permissions/auth';
import {AuthService} from '../editor/services/auth';
import {User} from '../editor/models/user';
import '../editor/rxjs-add';


@Injectable()
export class MockHttpService {
    post(_path: string, _json?: any) {}
}

@Injectable()
export class MockAuthGuard {
    is_logged_in: boolean = false;
}

@Injectable()
export class MockUser {}

export const PROVIDERS = [
    AuthService,
    { provide: XHRBackend, useClass: MockBackend},
    { provide: AuthGuard, useClass: MockAuthGuard },
    { provide: User, useClass: MockUser },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
];

// ace mock
(window as any).ace = {
    require(this: any) {
        return this;
    },
    Behaviour(this: any) {
        this.add = () => {};
    },
    Mode() {},
    TextHighlightRules() {},
    Range() {},
    FoldMode() {},
    TokenIterator() {},
    setCompleters () {},
    addCompleter() {},
};
