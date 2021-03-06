import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth';

let template = require<string>('./form.html');
let style = require<Webpack.Scss>('./form.scss');

@Component({
    selector: 'login',
    templateUrl: template,
    styles: [style.toString()],
})
export class LoginForm {
    loginAttemptFailed: boolean = false;
    username: string;
    password: string;

    constructor(
        private router: Router,
        private auth: AuthService) {
    }

    doLogin(event: Event) {
        event.preventDefault();
        this.auth.login(
            this.username,
            this.password
        ).subscribe(res => {
            if (res.status === 200) {
                this.router.navigate([this.auth.redirectUrl()]).then(() => {
                    this.username = '';
                    this.password = '';
                });
            } else {
                this.loginAttemptFailed = true;
            }
        }, () => {
            this.loginAttemptFailed = true;
        });
    }

    // private loginAttemptFailed() {
    //     this.paswd_input_state = next_input_state(
    //         this.paswd_input_state, InputEvent.InvalidLoginAttempt);
    //     this.login_input_state = next_input_state(
    //         this.login_input_state, InputEvent.InvalidLoginAttempt);
    // }
}
