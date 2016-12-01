import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';

import {GameCanvas} from './runner/game-canvas.component';
import {GameState} from './runner/game-state';
import {LycanService} from './runner/lycan.service';


@NgModule({
    imports: [SharedModule],
    declarations: [
        GameCanvas
    ],
    providers: [
        LycanService,
        GameState,
    ],
})
export class RunnerModule {}
