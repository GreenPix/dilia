precision highp float;

uniform sampler2D texture;
uniform bool flip_y;

varying vec2 f_tex;

void main()
{
    vec4 tc;
    if (flip_y) {
        tc = texture2D( texture, vec2(f_tex.x, 1.0 -f_tex.y));
    } else {
        tc = texture2D( texture, f_tex );
    }
    gl_FragColor = tc;
}
