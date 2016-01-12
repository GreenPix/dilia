
export class Texture {
    width: number;
    height: number;
    tex_id: WebGLTexture;
}


export class TextureLoader {

    constructor(private gl: WebGLRenderingContext) {}

    loadTexture(path: string, cb: (tex: Texture) => void) {
        let img = new Image();
        let gl = this.gl;
        let tex_id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex_id);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                      new Uint8Array([0, 0, 255, 255]));
        img.src = path;

        function isPowerOf2(value) {
          return (value & (value - 1)) == 0;
        }

        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, tex_id);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, img);
            if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            } else {
                // Check that:
                // No, it's not a power of 2. Turn off mips and set wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            let tex = new Texture();
            tex.tex_id = tex_id;
            tex.width = img.width;
            tex.height = img.height;
            cb(tex);
        };
    }
}
