import {Component, View} from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup} from 'angular2/angular2';
import {CORE_DIRECTIVES} from 'angular2/angular2';
import {Router, OnActivate, ComponentInstruction} from 'angular2/router';
import {HttpService} from '../../services/index';

let template = require<string>('./form.html');
let style = require<string>('./form.css');

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
})
@View({
    templateUrl: template,
    styles: [style],
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class LoginForm implements OnActivate {
    loginForm: HasLoginDetails;

    constructor(builder: FormBuilder, private router: Router, private http: HttpService) {
        this.loginForm = builder.group(<LoginDetails>{
            login: ["", Validators.required],
            password: ["", Validators.required]
        });
    }

    doLogin(event: Event) {
        event.preventDefault();
        if (this.loginForm.valid) {

            this.http.post('/api/login', {
                username: this.loginForm.value.login,
                password: this.loginForm.value.password
            })
            .subscribe((res) => {
                if (res.status === 200) {
                    this.router.navigate(["/RuleEditor"]);
                } else {

                }
            });
        }
    }

    onActivate(next: ComponentInstruction, prev: ComponentInstruction) {
        let promise = new Promise<void>((resolve, reject) => {
            this.http.post('/api/verify')
                .map(res => res.json())
                .subscribe((res:any) => {
                    if (res.authenticated) {
                        this.router.navigate(["/RuleEditor"]);
                    }
                    resolve();
                })
        });
        return promise;
    }
}
