export enum AttributeKind {
    Mat2d,
    Tex2d,
};

export class Attribute {

    private location: number;

    constructor(
        private name: string,
        private kind: AttributeKind
    )
    {}

    locate(program: WebGLProgram, gl: WebGLRenderingContext) {
        this.location = gl.getAttribLocation(program, this.name);
    }
}

export class Uniform {

}
