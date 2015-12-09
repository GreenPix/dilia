import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';
import {User} from '../../models/user';


let profileTemplate = require<string>('./profile.html');

@Component({
    selector: 'user-profile'
})
@View({
    templateUrl: profileTemplate,
    directives: [CORE_DIRECTIVES]
})
export class Profile {

    constructor(private user: User) {}
}
