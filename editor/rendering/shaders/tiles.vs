uniform mat4 proj;
uniform uint tile_size;
uniform uint tex_wts;
uniform uint tex_hts;

attribute vec2 tile_pos;
attribute uint tile_tex_id;

varying vec2 v_tex_coords;

void main() {
    if (tile_tex_id == 0) {
        gl_Position = vec4(0.0);
    } else {
        gl_Position = proj * vec4(tile_pos, 0.0, 1.0);
        uint sprite_x = tile_tex_id - 1;// % uint(tex_wts * tex_hts);
        uint sprite_y = sprite_x / uint(tex_wts);
        sprite_x = sprite_x % uint(tex_wts);
        if (gl_VertexID % 4 == 0) {
            v_tex_coords = vec2(float(sprite_x) * 1.0 / tex_wts,     float(sprite_y) * 1.0 / tex_hts);
        } else if (gl_VertexID % 4 == 2) {
            v_tex_coords = vec2(float(sprite_x + uint(1)) * 1.0 / tex_wts, float(sprite_y) * 1.0 / tex_hts);
        } else if (gl_VertexID % 4 == 1) {
            v_tex_coords = vec2(float(sprite_x) * 1.0 / tex_wts,     float(sprite_y + uint(1)) * 1.0 / tex_hts);
        } else {
            v_tex_coords = vec2(float(sprite_x + uint(1)) * 1.0 / tex_wts, float(sprite_y + uint(1)) * 1.0 / tex_hts);
        }
    }
}
