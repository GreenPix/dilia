import {Component, View} from 'angular2/angular2';
import {FORM_DIRECTIVES, FormBuilder, Validators, ControlGroup} from 'angular2/angular2';

let template = require<string>('./form.html');
let style = require<string>('./form.css');

@Component({
  selector: 'login',
  viewBindings: [FormBuilder]
})
@View({
  template: template,
  styles: [style],
  directives: [FORM_DIRECTIVES]
})
class LoginForm {
    loginForm: ControlGroup;
    constructor(builder: FormBuilder) {
        this.loginForm = builder.group({
            login: ["", Validators.required],
            password: ["", Validators.required]
        });
    }
    doLogin(event: Event) {
        console.log(event);
    }
}
