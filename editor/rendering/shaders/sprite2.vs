attribute vec2 pos;
attribute vec2 tex;

uniform vec2 obj_pos;
uniform vec2 view_pos;
uniform vec2 viewport_size;

varying vec2 f_tex;

void main(void) {
    gl_Position = vec4(2.0 * (pos + obj_pos - view_pos) / viewport_size - 1.0, 0.0, 1.0);
    f_tex = tex;
}
