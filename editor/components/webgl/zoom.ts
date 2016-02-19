import {Camera} from '../../rendering/camera';

export interface MouseObjectSpace {
    mouseUp(button: number, mx: number, my: number);
    mouseDown(button: number, mx: number, my: number);
    mouseMove(event: MouseEvent, mx: number, my: number);
    mouseWheel(deltaY: number, mx: number, my: number);
}


export class ZoomBehavior implements MouseObjectSpace {

    private last_mouse_pos: [number, number] = [0, 0];
    private last_button_pressed: number = -1;

    constructor(
        private camera: Camera
    ) {}

    desactivate() {
        this.last_button_pressed = -1;
    }

    mouseUp(button: number, mx: number, my: number) {
        this.last_button_pressed = -1;
    }

    mouseDown(button: number, mx: number, my: number) {
        if (button === 1) {
            this.last_button_pressed = 1;
            this.last_mouse_pos = [mx, my];
        } else {
            this.last_button_pressed = -1;
        }
    }

    mouseMove(event: MouseEvent, mx: number, my: number) {
        if (this.last_button_pressed === 1) {
            let dx = mx - this.last_mouse_pos[0];
            let dy = my - this.last_mouse_pos[1];
            this.camera.translate(dx, dy);
            this.last_mouse_pos = this.objectSpace(event);
        }
    }

    mouseWheel(deltaY: number, mx: number, my: number) {
        this.last_mouse_pos = [mx, my];
        if (deltaY < 0) {
            this.camera.zoom(0.1, this.last_mouse_pos);
        } else {
            this.camera.zoom(-0.1, this.last_mouse_pos);
        }
    }

    private objectSpace(event: MouseEvent): [number, number] {
        return this.camera.fromWindowCoordToObjectSpace(
            event.clientX, event.clientY - 63
        );
    }
}
