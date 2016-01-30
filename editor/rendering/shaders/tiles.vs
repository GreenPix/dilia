uniform mat3 proj;

attribute vec2 tile_pos;
attribute vec2 tile_tex_coord;

varying vec2 v_tex_coords;

void main() {
    if (tile_tex_coord.x == 0.0 && tile_tex_coord.y == 0.0) {
        gl_Position = vec4(0.0);
        v_tex_coords = vec2(0.0);
    } else {
        gl_Position = vec4(proj * vec3(tile_pos, 1.0), 1.0);
        // gl_Position = proj * vec4(tile_pos, 0.0, 1.0);
        v_tex_coords = vec2(tile_tex_coord.x - 1.0, tile_tex_coord.y - 1.0);
    }
}
