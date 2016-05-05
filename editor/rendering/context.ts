import {Program} from '../gl/gl';
import {CameraProperties} from './interfaces';


export class Context {
    active_camera_props: CameraProperties = undefined;
    active_program: Program = undefined;
    active_camera: Float32Array = undefined;
    flip_y: boolean = false;
    constructor(
        public gl: WebGLRenderingContext
    ) {}
}
