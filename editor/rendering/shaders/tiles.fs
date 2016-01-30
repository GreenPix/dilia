precision highp float;

uniform sampler2D tile_tex;
varying vec2 v_tex_coords;

void main() {
    // vec3 gamma = vec3(2.2);
    vec4 tex_color = texture2D(tile_tex, vec2(v_tex_coords.x, 1.0 - v_tex_coords.y));
    // gl_FragColor = vec4(pow(tex_color.rgb, gamma), tex_color.a);
    gl_FragColor = tex_color;
}
