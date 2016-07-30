import {Command} from './interfaces';
import {Context} from './context';
import {Program} from '../gl/program';

let sprite_vertex_shader = require<string>('./shaders/sprite.vs');
let sprite_fragment_shader = require<string>('./shaders/sprite.fs');

let sprite2_vertex_shader = require<string>('./shaders/sprite2.vs');
let sprite2_fragment_shader = require<string>('./shaders/sprite2.fs');

let tiles_vertex_shader = require<string>('./shaders/tiles.vs');
let tiles_fragment_shader = require<string>('./shaders/tiles.fs');

let tiles2_vertex_shader = require<string>('./shaders/tiles2.vs');
let tiles2_fragment_shader = require<string>('./shaders/tiles2.fs');


export class ProgramEl implements Command {

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
    }
}

export const TileProgram = new ProgramEl(
    tiles_vertex_shader,
    tiles_fragment_shader
);

export const Tile2Program = new ProgramEl(
    tiles2_vertex_shader,
    tiles2_fragment_shader
);

export const SpriteProgram = new ProgramEl(
    sprite_vertex_shader,
    sprite_fragment_shader
);

export const Sprite2Program = new ProgramEl(
    sprite2_vertex_shader,
    sprite2_fragment_shader
);
