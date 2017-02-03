// In this module we try to detect if
// the keyboard layout of the user is QWERTY
// or AZERTY.
// We do so by assuming that we use ZQSD and WASD
// to control the character.


const enum DetectionState {
    QWERTY,
    AZERTY,
    NONE
}

const enum KeyState {
    RELEASED = 0b0001,
    JUST_RELEASED = 0b0011,
    PRESSED = 0b0100,
    JUST_PRESSED = 0b1100,
}

const MASK = 0b0101;

export const enum Keys {
    Z = 90,
    Q = 81,
    S = 83,
    D = 68,
    W = 87,
    A = 65,
}

export class KeyboardLayoutDetector {

    private state: DetectionState = DetectionState.NONE;

    private actionmap_qwerty: {[action: number]: number} = {};
    private actionmap_azerty: {[action: number]: number} = {};
    private keystate: {[key: number]: KeyState} = {
        [Keys.Z]: KeyState.RELEASED,
        [Keys.Q]: KeyState.RELEASED,
        [Keys.S]: KeyState.RELEASED,
        [Keys.D]: KeyState.RELEASED,
        [Keys.W]: KeyState.RELEASED,
        [Keys.A]: KeyState.RELEASED,
    };
    private keyoccurences = {
        [Keys.Z]: 0,
        [Keys.Q]: 0,
        [Keys.S]: 0,
        [Keys.D]: 0,
        [Keys.W]: 0,
        [Keys.A]: 0,
    };

    ingestPressed(event: KeyboardEvent) {
        if (!isKeyValid(event)) return;
        if (this.state === DetectionState.NONE) {
            this.keyoccurences[event.keyCode] += 1;
            this.detect();
        } else {
            let s = this.keystate[event.keyCode];
            this.keystate[event.keyCode] =
                ((~s & KeyState.PRESSED) << 1) | KeyState.PRESSED;
        }
    }

    ingestReleased(event: KeyboardEvent) {
        if (!isKeyValid(event)) return;
        if (this.state !== DetectionState.NONE) {
            let s = this.keystate[event.keyCode];
            this.keystate[event.keyCode] =
                ((~s & KeyState.RELEASED) << 1) | KeyState.RELEASED;

        }
    }

    nextKeyState() {
        for (let key in this.keystate) {
            this.keystate[key] = this.keystate[key] & MASK;
        }
    }

    isPressed(action: number): boolean {
        if (this.state === DetectionState.QWERTY) {
            return isPressed(this.keystate[this.actionmap_qwerty[action]]);
        } else if (this.state === DetectionState.AZERTY) {
            return isPressed(this.keystate[this.actionmap_azerty[action]]);
        } else {
            return false;
        }
    }

    isJustPressed(action: number): boolean {
        if (this.state === DetectionState.QWERTY) {
            return this.keystate[this.actionmap_qwerty[action]] ===
                KeyState.JUST_PRESSED;
        } else if (this.state === DetectionState.AZERTY) {
            return this.keystate[this.actionmap_azerty[action]] ===
                KeyState.JUST_PRESSED;
        } else {
            return false;
        }
    }

    isReleased(action: number): boolean {
        if (this.state === DetectionState.QWERTY) {
            return isReleased(this.keystate[this.actionmap_qwerty[action]]);
        } else if (this.state === DetectionState.AZERTY) {
            return isReleased(this.keystate[this.actionmap_azerty[action]]);
        } else {
            return false;
        }
    }

    isJustReleased(action: number): boolean {
        if (this.state === DetectionState.QWERTY) {
            return this.keystate[this.actionmap_qwerty[action]] ===
                KeyState.JUST_RELEASED;
        } else if (this.state === DetectionState.AZERTY) {
            return this.keystate[this.actionmap_azerty[action]] ===
                KeyState.JUST_RELEASED;
        } else {
            return false;
        }
    }

    register(layout: 'qwerty' | 'azerty', action: number, key: Keys) {
        if (layout === 'qwerty') {
            this.actionmap_qwerty[action] = key;
        } else {
            this.actionmap_azerty[action] = key;
        }
    }

    private detect() {
        if (this.keyoccurences[Keys.Z] > this.keyoccurences[Keys.W]
         && this.keyoccurences[Keys.Q] > this.keyoccurences[Keys.A]) {
            this.state = DetectionState.AZERTY;
        }
        if (this.keyoccurences[Keys.W] > this.keyoccurences[Keys.Z]
         && this.keyoccurences[Keys.A] > this.keyoccurences[Keys.Q]) {
            this.state = DetectionState.QWERTY;
        }
    }
}

function isReleased(value: KeyState): boolean {
    return (value & KeyState.RELEASED) === KeyState.RELEASED;
}

function isPressed(value: KeyState): boolean {
    return (value & KeyState.PRESSED) === KeyState.PRESSED;
}

function isKeyValid(event: KeyboardEvent): boolean {
    return (event.keyCode === Keys.Z ||
            event.keyCode === Keys.Q ||
            event.keyCode === Keys.S ||
            event.keyCode === Keys.D ||
            event.keyCode === Keys.W ||
            event.keyCode === Keys.A) && !event.repeat;
}
