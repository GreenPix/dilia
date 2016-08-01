import {newUniform, UniformCb} from './uniform';
import {VertexBuffer, BufferCb} from './buffer';

export class Program {

    private program: WebGLProgram;
    private uniforms: { [uniform_name: string] : UniformCb };
    private attrs_to_buffer: { [attr_name: string]: BufferCb };

    constructor(
        private gl: WebGLRenderingContext
    ) {}

    src(vertex_src: string, fragment_src: string) {
        let gl = this.gl;
        let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        let program = gl.createProgram();
        this.program = program;
        this.uniforms = {};
        this.attrs_to_buffer = {};

        gl.shaderSource(vertex_shader, vertex_src);
        gl.shaderSource(fragment_shader, fragment_src);

        gl.compileShader(vertex_shader);

        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            throw `Couldn't compile vertex shader: ${gl.getShaderInfoLog(vertex_shader)}`;
        }

        gl.compileShader(fragment_shader);

        if (!gl.getShaderParameter(fragment_shader, gl.COMPILE_STATUS)) {
            throw `Couldn't compile vertex shader: ${gl.getShaderInfoLog(fragment_shader)}`;
        }

        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw `Couldn't link program:
                    ${gl.getProgramInfoLog(program)}`;
        }

        // gl.detachShader(program, vertex_shader);
        // gl.detachShader(program, fragment_shader);
        //
        // gl.deleteShader(vertex_shader);
        // gl.deleteShader(fragment_shader);

        // Collecting the list of uniforms and preparing the callbacks
        // when the values are going to be set.
        let nb_uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        let last_used_texture_unit = 0;

        for (let i = 0; i < nb_uniforms; ++i) {
            let uniform_info = gl.getActiveUniform(program, i);
            if (uniform_info) {
                let loc = gl.getUniformLocation(program, uniform_info.name);
                let [uniform, new_ltu] = newUniform(
                    gl, loc, uniform_info, last_used_texture_unit
                );
                last_used_texture_unit = new_ltu;
                this.uniforms[uniform_info.name] = uniform;
            }
        }

        let nb_attribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < nb_attribs; ++i) {
            let attrib_info = gl.getActiveAttrib(program, i);
            if (attrib_info) {
                let loc = gl.getAttribLocation(program, attrib_info.name);

                this.attrs_to_buffer[attrib_info.name] = (buffer: VertexBuffer) => {
                    buffer.bindAtLocation(loc);
                };
            }
        }
    }

    getBindBufferCallback(attr_name: string): BufferCb {
        return this.attrs_to_buffer[attr_name];
    }

    setUniforms(values: { [uniform_name: string]: any }) {
        for (let name in values) {
            let glUniform = this.uniforms[name];
            let value = values[name];
            if (glUniform) {
                glUniform(value);
            }
        }
    }

    use(): WebGLRenderingContext {
        this.gl.useProgram(this.program);
        return this.gl;
    }
}
