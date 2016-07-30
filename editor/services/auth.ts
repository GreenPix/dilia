import {Injectable} from '@angular/core';
import {Response} from '@angular/http';
import {HttpService, Observable} from './index';
import {User} from '../models/user';

@Injectable()
export class AuthService {

    is_logged_in: boolean = false;
    redirect_url: string;

    constructor(
        private http: HttpService,
        private user: User
    ) {}

    login(username: string, password: string): Observable<Response> {
        let observable = this.http.post('/api/login', {
            username,
            password
        }).share();

        observable.subscribe(res => {
            if (res.status === 200) {
                this.user.username = username;
            }
        }, () => {});

        return observable;
    }

    redirectUrl(): string {
        return this.redirect_url ? this.redirect_url: 'map-editor';
    }

    logout() {
        this.is_logged_in = false;
    }
}
