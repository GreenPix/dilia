import {TextureLoader, Geom, glDrawBuffers, glDrawElements} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';
import {Camera} from './camera';
import {TilesLayer, TilesLayerBuilder} from './tiles';
import {Texture} from '../gl/tex';

// A rendering context offers some
// common API to allow drawing of things.
export interface RenderingContext {
    draw(camera: Camera);
}


abstract class BaseRenderingContext {
    protected tex_loader: TextureLoader;
    private resources_not_yet_loaded: number = 0;

    constructor(
        protected gl: WebGLRenderingContext
    ) {
        this.tex_loader = new TextureLoader(this.gl);
    }

    protected loadTexture(path: string, cb: (t: Texture) => void): void {
        this.resources_not_yet_loaded += 1;
        this.tex_loader.loadTexture(path, tex => {
            cb(tex);
            this.resources_not_yet_loaded -= 1;
        });
    }

    draw(camera: Camera) {
        if (this.resources_not_yet_loaded === 0) {
            this.drawImpl(camera);
        }
    }

    protected abstract drawImpl(camera: Camera);
}

export class GenericRenderingContext extends BaseRenderingContext {

    private uniforms_values: { [name: string]: any } = {};
    private buffers: BufferLinkedToProgram[] = [];
    private indices: IndicesBuffer;
    private program: Program;

    constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    setShader(vertex_shader_src: string, fragment_shader_src: string): this {
        this.program = new Program(this.gl);
        this.program.src(vertex_shader_src, fragment_shader_src);
        return this;
    }

    setTexture(uniform_name: string, path: string): this {
        this.loadTexture(path, tex => {
            this.uniforms_values[uniform_name] = tex.tex_id;
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

    protected drawImpl(camera: Camera) {

        if (this.buffers.length > 0) {

            // make sure the program is active
            this.program.use();
            this.uniforms_values['proj'] = (camera as any).values;
            this.program.setUniforms(this.uniforms_values);

            if (this.indices) {
                glDrawElements(
                    Geom.TRIANGLES,
                    this.gl,
                    this.indices, ...this.buffers);
            } else {
                glDrawBuffers(
                    Geom.TRIANGLES,
                    this.gl,
                    ...this.buffers);
            }
        }
    }

}

let tiles_vertex_shader = require<string>('./shaders/tiles.vs');
let tiles_fragment_shader = require<string>('./shaders/tiles.fs');

export class TilesRenderingContext extends BaseRenderingContext {

    private program: Program;
    private objects: Array<TilesLayer> = [];

    constructor(
        gl: WebGLRenderingContext
    ) {
        super(gl);
        this.program = new Program(gl);
        this.program.src(tiles_vertex_shader, tiles_fragment_shader);
    }

    addObject(
        chipset_paths: string[],
        cb: (chipset_datas: Texture[], object: TilesLayerBuilder) => void): this
    {
        let tl = new TilesLayer(this.gl);
        let nb_chipset = chipset_paths.length;
        let chipset_datas = new Array(nb_chipset);
        for (let i = 0; i < nb_chipset; ++i) {
            // TODO: Remove this once TypeScript 1.8 is released
            ((i: number) => {
            this.loadTexture(chipset_paths[i], tex => {
                chipset_datas[i] = tex;
                if (--nb_chipset === 0) {
                    cb(chipset_datas, tl);
                }
            });
            // TODO: Remove this once TypeScript 1.8 is released
            })(i);
        }
        this.objects.push(tl);
        return this;
    }

    protected drawImpl(camera: Camera) {

        this.program.use();
        this.program.setUniforms({
            'proj': (camera as any).values
        });

        for (let object of this.objects) {
            object.draw(this.gl, this.program, camera);
        }
    }
}
