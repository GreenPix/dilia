import {Context} from './context';


/// CommandBuffer element. Each element is executed
/// one after another with a precised order controlled
/// by the CommandBuffer. When executed, the element can
/// modify the WebGL state without consideration
/// for going back to the previous state. Furthermore,
/// it can modify the context interface that include
/// some usefull metadata additionally to the WebGL inner
/// state.
export interface Command {

    /// Execute this element. This can modify the context
    /// as well as changing the WebGL state.
    execute(ctx: Context): void;
}

/// A pipeline is the unit executed by a surface.
/// Within this single call, everything is expected to
/// be rendered on screen.
export interface Pipeline {
    render(gl: WebGLRenderingContext): void;
}

export interface TextureGetter {
    getTextures(): WebGLTexture[];
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
