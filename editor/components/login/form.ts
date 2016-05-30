import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';
import {FORM_DIRECTIVES, CORE_DIRECTIVES} from '@angular/common';
import {Router, OnActivate, ComponentInstruction} from '@angular/router-deprecated';
import {HttpService} from '../../services/index';
import {User} from '../../models/user';
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
export class LoginForm implements OnActivate {
    loginForm: HasLoginDetails;

    constructor(
        builder: FormBuilder,
        private router: Router,
        private http: HttpService,
        private user: User) {
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

            this.http.post('/api/login', {
                username: this.loginForm.value.login,
                password: this.loginForm.value.password
            })
            .subscribe(res => {
                if (res.status === 200) {
                    this.user.username = this.loginForm.value.login;
                    this.router.navigate(['/ScriptEditor']);
                } else {

                }
            });
        }
    }

    routerOnActivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let promise = new Promise<void>((resolve, reject) => {
            this.http.post('/api/verify')
                .map(res => res.json())
                .subscribe((res:any) => {
                    if (res.authenticated) {
                        this.router.navigate(['/ScriptEditor']);
                    }
                    resolve();
                });
        });
        return promise;
    }
}
