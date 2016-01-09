attribute vec2 pos;
attribute vec2 texCoord;

uniform mat2 proj;

varying vec2 ftexCoord;

void main()
{
    gl_Position = vec4(proj * texCoord, 0.0, 1.0);
    ftexCoord = texCoord;
}
