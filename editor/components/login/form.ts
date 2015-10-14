import {Component, View} from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup} from 'angular2/angular2';
import {CORE_DIRECTIVES} from 'angular2/angular2';
import {Router, OnActivate, ComponentInstruction} from 'angular2/router';
import {Http, Response} from 'angular2/http';
import {Headers} from 'angular2/http';
import {Promise} from 'es6-shim';


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

    constructor(builder: FormBuilder, private router: Router, private http: Http) {
        this.loginForm = builder.group(<LoginDetails>{
            login: ["", Validators.required],
            password: ["", Validators.required]
        });
    }

    doLogin(event: Event) {
        event.preventDefault();
        if (this.loginForm.valid) {
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');

            this.http.post('/api/login', JSON.stringify({
                username: this.loginForm.value.login,
                password: this.loginForm.value.password
            }), { headers: headers })
            .subscribe((res: Response) => {
                if (res.status === 200) {
                    this.router.navigate(["/RuleEditor", {param: [1, 2, 3]}]);
                } else {

                }
            });
        }
    }

    onActivate(next: ComponentInstruction, prev: ComponentInstruction) {

    }
}
