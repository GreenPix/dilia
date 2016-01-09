export class Program {

    private program: WebGLProgram;

    constructor(
        private gl: WebGLRenderingContext
    ) {}

    src(vertex_src: string, fragment_src: string) {
        let gl = this.gl;
        let vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        let program = gl.createProgram();

        gl.shaderSource(vertex_shader, vertex_src);
        gl.shaderSource(fragment_shader, fragment_src);

        gl.compileShader(vertex_shader);
        gl.compileShader(fragment_shader);

        if (!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS)) {
            throw `Couldn't compile vertex shader: ${gl.getShaderInfoLog(vertex_shader)}`;
        }

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

        gl.detachShader(program, vertex_shader);
        gl.detachShader(program, fragment_shader);

        gl.deleteShader(vertex_shader);
        gl.deleteShader(fragment_shader);
    }

    uniform(name: string): WebGLUniformLocation {
        return this.gl.getUniformLocation(this.program, name);
    }

    // use(...attributes: Attribute[]) {
    //     this.gl.useProgram(this.program);
    //     // Binding attributes values
    //     for (let attr of attributes) {
    //         switch (attr.kind) {
    //             case AK.Mat2d:
    //                 let mat: Matrix2d = attr.value as Matrix2d;
    //                 this.gl.uniformMatrix2fv(
    //                     attr.location,
    //                     false,
    //                     new Float32Array(mat)
    //                 );
    //                 break;
    //             case AK.Tex2d:
    //                 this.gl.unif
    //                 break;
    //             default:
    //                 throw 'Unimplemented';
    //         }
    //     }
    // }
}

export type Matrix2d = number[];

export enum AK {
    Mat2d,
    Tex2d,
}
