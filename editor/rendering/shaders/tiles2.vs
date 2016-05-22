attribute vec2 quad_pos;
attribute vec2 quad_tex;

varying vec2 pixel_coord;
varying vec2 tex_coord;

uniform vec2 view_pos;
uniform vec2 viewport_size;
uniform vec2 inverse_map_size;
uniform float tile_size;

void main(void) {
   pixel_coord = (quad_tex * viewport_size) + view_pos;
   // TODO: is it more numerically stable to pass a uniform which is the 
   // inverse of tile_size?
   tex_coord = pixel_coord * inverse_map_size / tile_size;
   gl_Position = vec4(quad_pos, 0.0, 1.0);
}
