import {Camera} from './camera';
import {RenderingContext} from './context';

export class SceneManager {

    constructor(private state_stack: Array<Camera | RenderingContext>) {}

    viewport(width: number, height: number) {
        for (let state of this.state_stack) {
            if (state instanceof Camera) {
                state.viewport(width, height);
            }
        }
    }

    draw() {
        let camera: Camera;
        for (let render_ctx of this.state_stack) {
            if (render_ctx instanceof Camera) {
                camera = render_ctx;
            } else {
                (render_ctx as RenderingContext).draw(camera);
            }
        }
    }
}
