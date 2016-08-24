import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import {Injectable, provide} from '@angular/core';
import {AuthGuard} from '../editor/permissions/auth';
import {AuthService} from '../editor/services/auth';
import {User} from '../editor/models/user';


@Injectable()
export class MockHttpService {
    post(path: string, json?: any) {}
}

@Injectable()
export class MockAuthGuard {
    is_logged_in: boolean = false;
}

@Injectable()
export class MockUser {}

export const PROVIDERS = [
    AuthService,
    provide(AuthGuard, { useClass: MockAuthGuard }),
    provide(User, { useClass: MockUser }),
    provide(LocationStrategy, { useClass: HashLocationStrategy }),
];

// ace mock
(window as any).ace = {
    require: function() {
        return this;
    },
    Behaviour: function() {
        this.add = () => {};
    },
    Mode: function() {},
    TextHighlightRules: function() {},
    Range: function() {},
    FoldMode: function() {},
    TokenIterator: function() {},
    setCompleters: function () {},
    addCompleter: function() {},
};