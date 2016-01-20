
export enum BufferDrawKind {
    STATIC_DRAW,
    DYNAMIC_DRAW,
    STREAM_DRAW
}

export type BufferCb = (buffer: VertexBuffer) => void;

export class IndicesBuffer {

    private handle: WebGLBuffer;
    private draw_type: number;
    private len: number = 0;

    constructor(
        private gl: WebGLRenderingContext,
        draw_type = BufferDrawKind.STATIC_DRAW
    ) {
        this.handle = gl.createBuffer();
        this.draw_type = toNumber(gl, draw_type);
    }

    fillTyped(values: Uint16Array): this {
        this.len = values.length;
        this.bind();
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, values, this.draw_type);
        return this;
    }

    fill(values: number[]): this {
        let buffer = new Uint16Array(values);
        this.len = values.length;
        this.bind();
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, buffer, this.draw_type);
        return this;
    }

    bufferLength(): number {
        return this.len;
    }

    type(): number {
        // Other possible value: gl.UNSIGNED_SHORT or gl.UNSIGNED_BYTE
        return this.gl.UNSIGNED_SHORT;
    }

    bind(): void {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.handle);
    }
}

export class VertexBuffer {

    private draw_type: number;
    private handle: WebGLBuffer;
    private should_normalize: boolean = false;
    private nb_comp = 3;
    private count: number = 0;

    constructor(
        private gl: WebGLRenderingContext,
        draw_type = BufferDrawKind.STATIC_DRAW
    ) {
        this.handle = gl.createBuffer();
        this.draw_type = toNumber(gl, draw_type);
    }

    // Builder like API to normalize the buffer
    normalize(): this {
        this.should_normalize = true;
        return this;
    }

    // Set the number of components for this vertex
    // buffer. Must be 1, 2, 3 or 4
    numberOfComponents(s: number): this {
        if (s !== 1 && s !== 2 && s !== 3 && s !== 4) {
            throw new Error('Number of components for VertexBuffer must be 1, 2, 3 or 4');
        }
        this.count = (this.count * this.nb_comp) / s;
        this.nb_comp = s;
        return this;
    }

    numberOfVertices(): number {
        return this.count;
    }

    fillTyped(values: Float32Array): this {
        this.count = values.length / this.nb_comp;
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, values, this.draw_type);
        return this;
    }

    // Fill the buffer with the given values.
    fill(values: number[]): this {
        let buffer = new Float32Array(values);
        this.count = values.length / this.nb_comp;
        this.bind();
        this.gl.bufferData(this.gl.ARRAY_BUFFER, buffer, this.draw_type);
        return this;
    }

    // Bind the buffer.
    bind(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.handle);
    }

    // Bind at specific location (used by Program)
    bindAtLocation(location: number): void {
        this.bind();
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(
            location,
            this.nb_comp,
            this.gl.FLOAT,
            this.should_normalize,
            0, // Stride: used if this buffer would be used for multiple locations
            0  // Offset for the first component (again useful in same scenario as above)
        );
    }
}

function toNumber(gl: WebGLRenderingContext, draw_type: BufferDrawKind): number {
    if (draw_type === BufferDrawKind.STREAM_DRAW) {
        return gl.STREAM_DRAW;
    } else if (draw_type === BufferDrawKind.DYNAMIC_DRAW) {
        return gl.DYNAMIC_DRAW;
    } else {
        return gl.STATIC_DRAW;
    }
}
