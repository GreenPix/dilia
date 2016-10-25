import {Component} from '@angular/core';
import {User} from '../../models/user';


let profileTemplate = require<string>('./profile.html');

@Component({
    selector: 'user-profile',
    templateUrl: profileTemplate,
})
export class Profile {

    constructor(private user: User) {
        // Hack to get TypeScript stop complaining about variable not used.
        // FIXME: Find a better way to do so.
        this.user.username = this.user.username;
    }
}
