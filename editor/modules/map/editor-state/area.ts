import {WebGLSurface} from '../../../components';
import {Camera} from '../../../rendering/camera';
import {CommandBuffer} from '../../../rendering/commands';
import {ZoomBehavior} from '../../../components';


export abstract class Area {

    protected surface: WebGLSurface;
    protected camera: Camera = new Camera();
    protected zbehavior: ZoomBehavior = new ZoomBehavior(this.camera);
    protected scene: CommandBuffer;

    setSurface(surface: WebGLSurface) {
        this.surface = surface;
        this.surface.addViewportListener(this.camera);
    }

    cleanUp() {
        this.surface.removeViewportListener(this.camera);
    }

    isReady() {
        return this.scene !== undefined;
    }

    getScene() {
        return this.scene;
    }

    abstract activate();
    abstract deactivate();
}
