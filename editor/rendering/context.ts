import {TextureLoader, Geom, glDrawBuffers} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';

export class RenderingContext {

    private tex_loader: TextureLoader;
    private uniforms_values: { [name: string]: any } = {};
    private resources_not_yet_loaded: number = 0;
    private buffers: BufferLinkedToProgram[] = [];
    private indices: IndicesBuffer;
    private program: Program;

    constructor(
        private gl: WebGLRenderingContext
    ) {
        this.tex_loader = new TextureLoader(this.gl);
    }

    setShader(vertex_shader_src: string, fragment_shader_src: string): this {
        this.program = new Program(this.gl);
        this.program.src(vertex_shader_src, fragment_shader_src);
        return this;
    }

    setTexture(uniform_name: string, path: string): this {
        this.resources_not_yet_loaded += 1;
        this.tex_loader.loadTexture(path, tex => {
            this.uniforms_values[uniform_name] = tex.tex_id;
            this.resources_not_yet_loaded -= 1;
        });
        return this;
    }

    addVertexBuffer(attr_name: string, values: number[], vec_size: number): this {
        let buffer = new VertexBuffer(this.gl)
            .fill(values).numberOfComponents(vec_size);
        let blinked = new BufferLinkedToProgram(this.program, buffer, attr_name);
        this.buffers.push(blinked);
        return this;
    }

    setIndicesBuffer(indices: number[]): this {
        this.indices = new IndicesBuffer(this.gl).fill(indices);
        return this;
    }

    setUniform(uniform_name: string, value: any): this {
        this.uniforms_values[uniform_name] = value;
        return this;
    }

    draw() {
        if (this.buffers.length > 0 && this.indices && this.resources_not_yet_loaded === 0) {
            glDrawBuffers(
                Geom.TRIANGLES,
                this.program,
                this.uniforms_values,
                this.indices, ...this.buffers);
        }
    }

}
