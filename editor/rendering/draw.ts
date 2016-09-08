import {TextureLoader, Geom, glDrawBuffers, glDrawElements} from '../gl/gl';
import {Program, VertexBuffer} from '../gl/gl';
import {BufferLinkedToProgram, IndicesBuffer} from '../gl/gl';
import {Command, TextureGetter} from './interfaces';
import {Context} from './context';
import {TilesLayer, TilesLayerBuilder} from './tiles';
import {SpriteObject, SpriteBuilder} from './sprite';
import {Texture, Pixels} from '../gl/tex';
import * as values from 'lodash/values';



abstract class BaseRenderEl implements Command, TextureGetter {

    private resources_not_yet_loaded: number = 0;

    constructor(
        protected gl: WebGLRenderingContext,
        private tex_loader: TextureLoader
    ) {}

    protected loadTexture(
        path_or_color: string | [number, number, number, number] | Pixels,
        cb: (t: Texture) => void
    ): void {
        if (typeof path_or_color === 'string') {
            this.resources_not_yet_loaded += 1;
            this.tex_loader.loadTexture(path_or_color, tex => {
                cb(tex);
                this.resources_not_yet_loaded -= 1;
            });
        } else if (path_or_color instanceof Pixels) {
            this.tex_loader.loadTextureFromPixels(path_or_color, tex => {
                cb(tex);
            });
        } else {
            let color = new Uint8Array(path_or_color);
            this.tex_loader.loadSingleColorTexture(color, tex => {
                cb(tex);
            });
        }
    }

    execute(ctx: Context) {
        if (this.isReady()) {
            this.drawImpl(ctx);
        }
    }

    isReady(): boolean {
        return this.resources_not_yet_loaded === 0;
    }

    abstract getTextures(): Array<WebGLTexture>;

    protected abstract drawImpl(ctx: Context);
}

export class GenericRenderEl extends BaseRenderEl {

    private uniforms_values: { [name: string]: any } = {};
    private buffers: BufferLinkedToProgram[] = [];
    private indices: IndicesBuffer;
    private program: Program;

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

    getTextures(): Array<WebGLTexture> {
        return values<any>(this.uniforms_values)
            .filter(val => val instanceof Texture);
    }

    protected drawImpl(ctx: Context) {

        if (this.buffers.length > 0) {

            // make sure the program is active
            this.program.use();
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


export class SpriteRenderEl extends BaseRenderEl {

    private sprite_el: SpriteObject;

    constructor(
        gl: WebGLRenderingContext,
        tex_loader: TextureLoader
    ) {
        super(gl, tex_loader);
    }

    loadSpriteObject(
        tex_desc: string | [number, number, number, number] | Pixels | Texture,
        cb: (object: SpriteBuilder) => void
    ): this {
        this.sprite_el = new SpriteObject(this.gl);
        if (tex_desc instanceof Texture) {
            this.sprite_el.initWith(tex_desc);
            cb(this.sprite_el);
        } else {
            this.loadTexture(tex_desc, tex => {
                this.sprite_el.initWith(tex);
                cb(this.sprite_el);
            });
        }
        return this;
    }

    getTextures(): Array<WebGLTexture> {
        return [this.sprite_el.tex.tex_id];
    }

    protected drawImpl(ctx: Context) {

        this.sprite_el.draw(this.gl, ctx.active_program);
    }
}

export class TilesRenderEl extends BaseRenderEl {

    private tile_el: TilesLayer;

    constructor(
        gl: WebGLRenderingContext,
        tex_loader: TextureLoader
    ) {
        super(gl, tex_loader);
    }

    loadTileLayerObject(
        chipset_paths: string[],
        cb: (chipset_datas: Texture[], object: TilesLayerBuilder) => void
    ): this {
        this.tile_el = new TilesLayer(this.gl);
        let nb_chipset = chipset_paths.length;
        let chipset_datas = new Array(nb_chipset);
        for (let i = 0; i < nb_chipset; ++i) {
            this.loadTexture(chipset_paths[i], tex => {
                chipset_datas[i] = tex;
                if (--nb_chipset === 0) {
                    cb(chipset_datas, this.tile_el);
                }
            });
        }

        if (nb_chipset == 0) {
            cb(chipset_datas, this.tile_el);
        }
        return this;
    }

    getTextures(): Array<WebGLTexture> {
        return [];//this.tile_el.getTextures();
    }

    createSingleLayerRenderer(ref: { currentLayer(): number; }): Command {
        let gl = this.gl;
        let owner = this;

        class SingleLayer implements Command {

            constructor(private tile_el: TilesLayer) {}

            execute(ctx: Context) {
                if (owner.isReady()) {
                    let i = ref.currentLayer();
                    this.tile_el.drawSingleLayer(gl, ctx.active_program, i);
                }
            }
        }

        return new SingleLayer(this.tile_el);
    }

    protected drawImpl(ctx: Context) {

        this.tile_el.draw(this.gl, ctx.active_program);
    }
}
