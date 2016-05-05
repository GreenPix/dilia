import {PipelineEl} from './interfaces';
import {Context} from './context';
import {Program} from '../gl/program';

let sprite_vertex_shader = require<string>('./shaders/sprite.vs');
let sprite_fragment_shader = require<string>('./shaders/sprite.fs');

let tiles_vertex_shader = require<string>('./shaders/tiles.vs');
let tiles_fragment_shader = require<string>('./shaders/tiles.fs');


export class ProgramEl implements PipelineEl {

    private program: Program = undefined;

    constructor(
        private vert_src: string,
        private frag_src: string
    ) {}

    execute(ctx: Context) {
        if (!this.program) {
            this.program = new Program(ctx.gl);
            this.program.src(this.vert_src, this.frag_src);
        }
        ctx.active_program = this.program;
        this.program.use();
        this.program.setUniforms({
            flip_y: ctx.flip_y,
            proj: ctx.active_camera
        });
    }
}

export const TileProgram = new ProgramEl(
    tiles_vertex_shader,
    tiles_fragment_shader
);

export const SpriteProgram = new ProgramEl(
    sprite_vertex_shader,
    sprite_fragment_shader
);
