import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
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
