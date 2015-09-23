
import {Directive} from 'angular2/angular2';
import {RouterOutlet, ComponentInstruction} from 'angular2/router';


@Directive({
    selector: 'loggedin-router-outlet'
})
export class LoggedInRouterOutlet extends RouterOutlet {

    canActivate(instruction: ComponentInstruction) {
        console.log(arguments);
        return true;
    }
}
