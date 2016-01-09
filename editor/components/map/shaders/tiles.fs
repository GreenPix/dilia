precision highp float;

uniform sampler2D texture;

varying vec2 ftexCoord;

void main()
{
    gl_FragColor = texture2D( texture, ftexCoord);
}
