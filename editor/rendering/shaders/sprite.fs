precision highp float;

uniform sampler2D texture;
uniform bool is_overlay;
uniform bool flip_y;

varying vec2 ftexCoord;

void main()
{
    vec4 tc;
    if (flip_y) {
        tc = texture2D( texture, vec2(ftexCoord.x, 1.0 -ftexCoord.y));
    } else {
        tc = texture2D( texture, ftexCoord );
    }
    if (is_overlay) {
        vec4 bo = vec4(51.0 / 255.0, 122.0 / 255.0, 183.0 / 255.0, 0.70);
        vec3 rgbs = tc.rgb * (1.0 - bo.a) * tc.a + bo.rgb * bo.a;
        gl_FragColor = vec4(rgbs, tc.a);
    } else {
        gl_FragColor = tc;
    }
}
