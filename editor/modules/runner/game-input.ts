import {Injectable} from '@angular/core';
import {KeyboardLayoutDetector} from './keyboard-layout';
import {Keys} from './keyboard-layout';
import {MouseHandler, KeyHandler} from '../../components';
import {LycanService} from './lycan.service';
import {Direction} from '../../shared';
import {Player} from './player';


export const enum Actions {
    UP = 1,
    DOWN = 2,
    LEFT = 3,
    RIGHT = 4
}

@Injectable()
export class GameInput implements MouseHandler, KeyHandler {

    private keyboard = new KeyboardLayoutDetector();
    private actions_active: Actions[] = [];

    constructor(private lycan: LycanService, private player: Player) {
        this.keyboard.register('qwerty', Actions.UP, Keys.W);
        this.keyboard.register('qwerty', Actions.DOWN, Keys.S);
        this.keyboard.register('qwerty', Actions.LEFT, Keys.A);
        this.keyboard.register('qwerty', Actions.RIGHT, Keys.D);
        this.keyboard.register('azerty', Actions.UP, Keys.Z);
        this.keyboard.register('azerty', Actions.DOWN, Keys.S);
        this.keyboard.register('azerty', Actions.LEFT, Keys.Q);
        this.keyboard.register('azerty', Actions.RIGHT, Keys.D);
    }

    update(dt: number) {
        let last_action = this.last_action();
        if (last_action) {
            switch (last_action) {
                case Actions.UP:
                    this.player.pos.y += this.player.nominal_speed * dt;
                    break;
                case Actions.DOWN:
                    this.player.pos.y -= this.player.nominal_speed * dt;
                    break;
                case Actions.LEFT:
                    this.player.pos.x -= this.player.nominal_speed * dt;
                    break;
                case Actions.RIGHT:
                    this.player.pos.x += this.player.nominal_speed * dt;
                    break;
            }
        }
    }

    private last_action(): number {
        let len = this.actions_active.length;
        if (this.actions_active.length > 0) {
            return this.actions_active[len - 1];
        }
        return 0;
    }

    keyPressed(event: KeyboardEvent) {
        this.keyboard.nextKeyState();
        this.keyboard.ingestPressed(event);
        if (this.keyboard.isJustPressed(Actions.UP)) {
            this.actions_active.push(Actions.UP);
            this.lycan.sendWalk(Direction.UP);
        } else if (this.keyboard.isJustPressed(Actions.DOWN)) {
            this.actions_active.push(Actions.DOWN);
            this.lycan.sendWalk(Direction.DOWN);
        } else if (this.keyboard.isJustPressed(Actions.LEFT)) {
            this.actions_active.push(Actions.LEFT);
            this.lycan.sendWalk(Direction.LEFT);
        } else if (this.keyboard.isJustPressed(Actions.RIGHT)) {
            this.actions_active.push(Actions.RIGHT);
            this.lycan.sendWalk(Direction.RIGHT);
        }
    }

    keyReleased(event: KeyboardEvent) {
        this.keyboard.nextKeyState();
        this.keyboard.ingestReleased(event);
        let send_action = false;
        if (this.keyboard.isJustReleased(Actions.UP)) {
            let pos = this.actions_active.indexOf(Actions.UP);
            if (pos !== -1) {
                this.actions_active.splice(pos, 1);
                send_action = true;
            }
        } else if (this.keyboard.isJustReleased(Actions.DOWN)) {
            let pos = this.actions_active.indexOf(Actions.DOWN);
            if (pos !== -1) {
                this.actions_active.splice(pos, 1);
                send_action = true;
            }
        } else if (this.keyboard.isJustReleased(Actions.LEFT)) {
            let pos = this.actions_active.indexOf(Actions.LEFT);
            if (pos !== -1) {
                this.actions_active.splice(pos, 1);
                send_action = true;
            }
        } else if (this.keyboard.isJustReleased(Actions.RIGHT)) {
            let pos = this.actions_active.indexOf(Actions.RIGHT);
            if (pos !== -1) {
                this.actions_active.splice(pos, 1);
                send_action = true;
            }
        }
        if (send_action) {
            let last_action = this.last_action();
            if (last_action === 0) {
                this.lycan.sendStopWalk();
            } else {
                this.lycan.sendWalk(dir(last_action));
            }
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

function dir(action: Actions): Direction {
    switch (action) {
        case Actions.UP: return Direction.UP;
        case Actions.DOWN: return Direction.DOWN;
        case Actions.LEFT: return Direction.LEFT;
        case Actions.RIGHT: return Direction.RIGHT;
    }
    return Direction.UP;
}
