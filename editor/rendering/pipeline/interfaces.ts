
export interface CameraProperties {
    pos: [number, number];
    // width  in object space
    wos: number;
    // height in object space
    hos: number;
}

export interface Context {
    active_camera_props: CameraProperties;
    active_camera: Float32Array;
    flip_y: boolean;
    gl: WebGLRenderingContext;
}

/// Pipeline element. Each element is executed
/// one after another with a precised order controlled
/// by the Pipeline. When executed, the element can
/// modify the WebGL state without consideration
/// for going back to the previous state. Furthermore,
/// it can modify the context interface that include
/// some usefull metadata additionally to the WebGL inner
/// state.
export interface PipelineEl {

    /// Execute this element. This can modify the context
    /// as well as changing the WebGL state.
    execute(ctx: Context);
}

export interface Obj2D {
    // Set the new position
    position(pos: [number, number]): void;
    // Returns the width of this object.
    getWidth(): number;
    // Returns the height of this object.
    getHeight(): number;
    // Returns the position of this object.
    getPosition(): [number, number];
}
