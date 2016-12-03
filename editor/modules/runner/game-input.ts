import {Injectable} from '@angular/core';
import {KeyboardLayoutDetector} from './keyboard-layout';
import {Keys} from './keyboard-layout';
import {MouseHandler, KeyHandler} from '../../components';
import {LycanService} from './lycan.service';
import {Direction} from './lycan.service';

export const enum Actions {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@Injectable()
export class GameInput implements MouseHandler, KeyHandler {

    private keyboard = new KeyboardLayoutDetector();

    constructor(private lycan: LycanService) {
        this.keyboard.register('qwerty', Actions.UP, Keys.W);
        this.keyboard.register('qwerty', Actions.DOWN, Keys.S);
        this.keyboard.register('qwerty', Actions.LEFT, Keys.A);
        this.keyboard.register('qwerty', Actions.RIGHT, Keys.D);
        this.keyboard.register('azerty', Actions.UP, Keys.Z);
        this.keyboard.register('azerty', Actions.DOWN, Keys.S);
        this.keyboard.register('azerty', Actions.LEFT, Keys.Q);
        this.keyboard.register('azerty', Actions.RIGHT, Keys.D);
    }

    update() {
        this.keyboard.nextKeyState();
    }

    keyPressed(event: KeyboardEvent) {
        this.keyboard.ingestPressed(event);
        if (this.keyboard.isJustPressed(Actions.UP)) {
            this.lycan.sendWalk(Direction.UP);
        } else if (this.keyboard.isJustPressed(Actions.DOWN)) {
            this.lycan.sendWalk(Direction.DOWN);
        } else if (this.keyboard.isJustPressed(Actions.LEFT)) {
            this.lycan.sendWalk(Direction.LEFT);
        } else if (this.keyboard.isJustPressed(Actions.RIGHT)) {
            this.lycan.sendWalk(Direction.RIGHT);
        }
    }

    keyReleased(event: KeyboardEvent) {
        this.keyboard.ingestReleased(event);
        if (this.keyboard.isReleased(Actions.UP) &&
            this.keyboard.isReleased(Actions.DOWN) &&
            this.keyboard.isReleased(Actions.LEFT) &&
            this.keyboard.isReleased(Actions.RIGHT)) {
            this.lycan.sendStopWalk();
        }
    }

    mouseDown(_event: MouseEvent) {
    }

    mouseUp(_event: MouseEvent) {
    }

    mouseMove(_event: MouseEvent) {
    }

    mouseWheel(_event: WheelEvent) {
    }
}
