import {Component} from '@angular/core';
import {CORE_DIRECTIVES} from '@angular/common';
import {User} from '../../models/user';


let profileTemplate = require<string>('./profile.html');

@Component({
    selector: 'user-profile',
    templateUrl: profileTemplate,
    directives: [CORE_DIRECTIVES]
})
export class Profile {

    constructor(private user: User) {}
}
