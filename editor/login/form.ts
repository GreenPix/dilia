import {Component, View} from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup} from 'angular2/angular2';
import {CORE_DIRECTIVES} from 'angular2/angular2';
import LoggedInService = require('../services/LoggedInService');

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
  viewBindings: [FormBuilder]
})
@View({
  templateUrl: template,
  styles: [style],
  directives: [CORE_DIRECTIVES, FORM_DIRECTIVES]
})
export class LoginForm {
    loginForm: HasLoginDetails;

    constructor(builder: FormBuilder, private loggedInService: LoggedInService) {
        this.loginForm = builder.group(<LoginDetails>{
            login: ["", Validators.required],
            password: ["", Validators.required]
        });
    }
    doLogin(event: Event) {
        event.preventDefault();
        if (this.loginForm.valid) {
            console.log(this.loginForm.value.login);
            console.log(this.loginForm.value.password);
            this.loggedInService.isUserLoggedIn = true;
        }
    }
}
