attribute vec2 position;
attribute vec3 color;

varying vec3 fcolor;

void main()
{
    gl_Position = vec4(position, 0.1, 1.0);
    fcolor = color;
}
