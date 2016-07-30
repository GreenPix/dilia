import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from '@angular/common';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth';
import {HttpService} from '../../services/index';
import {SERVICE_DIRECTIVES} from '../../services/directives';

let template = require<string>('./form.html');
let style = require<Webpack.Scss>('./form.scss');

interface LoginDetails {
    login: any;
    password: any;
}

class HasLoginDetails extends ControlGroup {
    value: LoginDetails;
}

@Component({
    selector: 'login',
    viewProviders: [FormBuilder],
    templateUrl: template,
    styles: [style.toString()],
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, SERVICE_DIRECTIVES]
})
export class LoginForm {
    loginForm: HasLoginDetails;
    loginAttemptFailed: boolean = false;

    constructor(
        builder: FormBuilder,
        private router: Router,
        private http: HttpService,
        private auth: AuthService) {
        this.loginForm = builder.group(<LoginDetails>{
            login: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    isLoginInvalid(): boolean {
        return (this.loginForm.controls['login'].errors &&
            this.loginForm.controls['login'].errors['required']);
    }

    isLoginValid(): boolean {
        return !(this.loginForm.controls['login'].errors &&
            this.loginForm.controls['login'].errors['required']);
    }

    isPasswordInvalid(): boolean {
        return (this.loginForm.controls['password'].errors &&
            this.loginForm.controls['password'].errors['required']);
    }

    isPasswordValid(): boolean {
        return !(this.loginForm.controls['password'].errors &&
            this.loginForm.controls['password'].errors['required']);
    }

    doLogin(event: Event) {
        event.preventDefault();
        if (this.loginForm.valid) {
            this.auth.login(
                this.loginForm.value.login,
                this.loginForm.value.password
            ).subscribe(res => {
                if (res.status === 200) {
                    this.router.navigate([this.auth.redirectUrl()]);
                } else {
                    this.loginAttemptFailed = true;
                }
            }, () => {
                this.loginAttemptFailed = true;
            });
        }
    }

    // private loginAttemptFailed() {
    //     this.paswd_input_state = next_input_state(
    //         this.paswd_input_state, InputEvent.InvalidLoginAttempt);
    //     this.login_input_state = next_input_state(
    //         this.login_input_state, InputEvent.InvalidLoginAttempt);
    // }
}
