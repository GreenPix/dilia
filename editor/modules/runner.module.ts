import {NgModule} from '@angular/core';
import {SharedModule} from '../components/shared.module';
import {LycanService} from '../services/lycan';

import {GameCanvas} from './runner/game-canvas.component';
import {GameState} from './runner/game-state';


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
