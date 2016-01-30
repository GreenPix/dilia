attribute vec2 pos;
attribute vec2 texCoord;

uniform mat3 proj;

varying vec2 ftexCoord;

void main()
{
    gl_Position = vec4(proj * vec3(pos, 1.0), 1.0);
    ftexCoord = texCoord;
}
