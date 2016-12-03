import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';

import {GameCanvas} from './runner/game-canvas.component';


@NgModule({
    imports: [SharedModule],
    declarations: [
        GameCanvas
    ],
})
export class RunnerModule {}
