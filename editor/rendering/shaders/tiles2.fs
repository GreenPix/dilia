precision highp float;

varying vec2 pixel_coord;
varying vec2 tex_coord;

uniform sampler2D tiles_tex;
uniform sampler2D tiles_index;

uniform vec2 inverse_tiles_tex_size;
uniform float tile_size;

void main(void) {
    // Tex coord is outside map range
    if (tex_coord.x < 0.0 ||
        tex_coord.x > 1.0 ||
        tex_coord.y < 0.0 ||
        tex_coord.y > 1.0) {
        discard;
    }
    vec4 tile = texture2D(tiles_index, tex_coord);

    // Blank tiles are represented by the maximum value
    if (tile.x == 1.0 && tile.y == 1.0) {
        discard;
    }
    vec2 tile_coord = floor(tile.xy * 256.0) * tile_size;
    vec2 offset_in_tile = tile_size - mod(pixel_coord, tile_size);
    offset_in_tile.x = tile_size - offset_in_tile.x;
    vec2 final_tex_coord = (tile_coord + offset_in_tile) * inverse_tiles_tex_size;
    gl_FragColor = texture2D(tiles_tex, final_tex_coord);
}
