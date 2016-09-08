import {Command} from './interfaces';
import {Context} from './context';
import {Program} from '../gl/program';

const sprite_vertex_shader = require<string>('./shaders/sprite.vs');
const sprite_fragment_shader = require<string>('./shaders/sprite.fs');

const tiles_vertex_shader = require<string>('./shaders/tiles.vs');
const tiles_fragment_shader = require<string>('./shaders/tiles.fs');


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

export class TileProgram extends ProgramEl {
    constructor() { super(tiles_vertex_shader, tiles_fragment_shader); }
}

export class SpriteProgram extends ProgramEl {
    constructor() { super(sprite_vertex_shader, sprite_fragment_shader); }
}
