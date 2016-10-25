import {Injectable} from '@angular/core';
import {CanActivate, Router}    from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {HttpService} from '../services';
import {AuthService} from '../services/auth';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private http: HttpService,
        private auth: AuthService,
        private router: Router
    ) {}

    canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        if (this.auth.is_logged_in) {
            return Observable.of(true);
        }

        let observable = this.http.post('/api/verify').share()
            .map(res => res.json())
            .map(res => res.authenticated as boolean);

        observable.subscribe(res => {
            if (res) {
                this.auth.is_logged_in = true;
            } else {
                // Store the attempted URL for redirecting
                this.auth.redirect_url = state.url;

                // Navigate to the login page
                this.router.navigate(['/login']);
            }
        });

        return observable;
    }
}
