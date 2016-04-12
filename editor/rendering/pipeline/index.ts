import {PipelineEl, Context} from './interfaces';

/// The clear all pipeline element performs
/// a clearColor, clearDepth and clear operations
/// on the WebGL state.
export const ClearAll = (ctx: Context) => {
    ctx.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    ctx.gl.clearDepth(1.0);
    ctx.gl.clear(ctx.gl.DEPTH_BUFFER_BIT | ctx.gl.COLOR_BUFFER_BIT);
};

// Flip the y axis.
export const FlipY = (ctx: Context) => {
    ctx.flip_y = true;
};


type PipelineElLambda = (ctx: Context) => void;

/// The pipeline class, this is where the execution
/// takes place. This is also the context owner.
export class Pipeline {

    private context: Context = undefined;
    private raw: PipelineEl[];

    constructor(
        raw: Array<PipelineEl | PipelineElLambda>
    ) {
        this.raw = raw.map(el => {
            if (typeof el == 'function') {
                // TODO: Remove 'as' in next version of TypeScript
                return {
                    execute: el as PipelineElLambda,
                };
            } else {
                // TODO: Remove 'as' in next version of TypeScript
                return el as PipelineEl;
            }
        });
    }

    execute(gl: WebGLRenderingContext) {
        this.reset_or_init(gl);
        for (let el of this.raw) {
            el.execute(this.context);
        }
    }

    private reset_or_init(gl: WebGLRenderingContext) {
        if (!this.context || this.context.gl !== gl) {
            this.context = {
                active_camera: undefined,
                active_camera_props: undefined,
                gl: gl,
                flip_y: false,
            };
        }
    }
}
