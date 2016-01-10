precision highp float;

uniform sampler2D texture;

varying vec2 ftexCoord;

void main()
{
    gl_FragColor = texture2D( texture, vec2(ftexCoord.x, 1.0 -ftexCoord.y));
}
