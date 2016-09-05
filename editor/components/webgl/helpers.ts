

export function init_gl_default(gl: WebGLRenderingContext) {
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
        gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
        gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA
    );
}
