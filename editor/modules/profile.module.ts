import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';

import {FileManager} from '../models/scripting';

import {Profile} from './profile/profile';


@NgModule({
    imports: [SharedModule],
    declarations: [
        Profile,
    ],
    providers: [
        FileManager,
    ],
    exports: [
        Profile,
    ],
})
export class ProfileModule {}
