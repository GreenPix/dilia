precision lowp float;

uniform sampler2D tile_tex;
uniform bool flip_y;
varying vec2 v_tex_coords;

void main() {
    if (flip_y) {
        gl_FragColor = texture2D(tile_tex, vec2(v_tex_coords.x, 1.0 - v_tex_coords.y));
    } else {
        gl_FragColor = texture2D(tile_tex, v_tex_coords);
    }
}
