
export type UniformCb = (value: any) => void;

export function newUniform(
    gl: WebGLRenderingContext,
    uniform_location: WebGLUniformLocation,
    uniform_info: { name: string, type: number, size: number },
    last_used_texture_unit: number
): [UniformCb, number] {

    let tex_type: number;
    let type = uniform_info.type;
    let size = uniform_info.size;
    let is_array = (uniform_info.size > 1 && uniform_info.name.substr(-3) === '[0]');

    let glUniform = resolveGlUniformFromType(uniform_location);

    function resolveGlUniformFromType(
        l: WebGLUniformLocation
    ): (value: any) => void {

        switch (type) {
            case gl.SAMPLER_2D: tex_type = gl.TEXTURE_2D; break;
            case gl.SAMPLER_CUBE: tex_type = gl.TEXTURE_CUBE_MAP; break;
        }

        switch (type) {
            // Floating point types
            case gl.FLOAT:
                if (is_array) return (v) => gl.uniform1fv(uniform_location, v);
                else return (v) => gl.uniform1f(uniform_location, v);
            case gl.FLOAT_VEC2:   return (v) => gl.uniform2fv(uniform_location, v);
            case gl.FLOAT_VEC3:   return (v) => gl.uniform3fv(uniform_location, v);
            case gl.FLOAT_VEC4:   return (v) => gl.uniform4fv(uniform_location, v);

            // Integer types
            case gl.INT:
                if (is_array) return (v) => gl.uniform1i(uniform_location, v);
                return (v) => gl.uniform1i(uniform_location, v);
            case gl.INT_VEC2:     return (v) => gl.uniform2iv(l, v);
            case gl.INT_VEC3:     return (v) => gl.uniform3iv(l, v);
            case gl.INT_VEC4:     return (v) => gl.uniform4iv(l, v);

            // Boolean types
            case gl.BOOL:
                if (is_array) return (v) => gl.uniform1iv(uniform_location, v);
                return (v) => gl.uniform1i(uniform_location, v);
            case gl.BOOL_VEC2:    return (v) => gl.uniform2iv(l, v);
            case gl.BOOL_VEC3:    return (v) => gl.uniform3iv(l, v);
            case gl.BOOL_VEC4:    return (v) => gl.uniform4iv(l, v);

            case gl.FLOAT_MAT2:   return (v) => gl.uniformMatrix2fv(l, false, v);
            case gl.FLOAT_MAT3:   return (v) => gl.uniformMatrix3fv(l, false, v);
            case gl.FLOAT_MAT4:   return (v) => gl.uniformMatrix4fv(l, false, v);

            // Texture types
            case gl.SAMPLER_2D:
            case gl.SAMPLER_CUBE:
                if (is_array) {
                    let units = new Int32Array(size);
                    for (let i = 0; i < size; ++i) {
                        units[i] = last_used_texture_unit++;
                    }
                    return (textures: WebGLTexture[]) => {
                        gl.uniform1iv(l, units);
                        textures.forEach((texture, index) => {
                            gl.activeTexture(gl.TEXTURE0 + units[index]);
                            gl.bindTexture(tex_type, texture);
                        });
                    };
                } else {
                    let tex_unit = last_used_texture_unit++;
                    return (texture: WebGLTexture) => {
                        gl.uniform1i(l, tex_unit);
                        gl.activeTexture(gl.TEXTURE0 + tex_unit);
                        gl.bindTexture(tex_type, texture);
                    };
                }
            default:
                // This code should never be executed.
                throw ('Unknown GL Type! : ' + type.toString(16));
        }
    }

    return [glUniform, last_used_texture_unit];
}
