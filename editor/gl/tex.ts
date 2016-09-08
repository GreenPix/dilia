
export class Texture {
    width: number = 1;
    height: number = 1;
    tex_id: WebGLTexture = undefined;
}

export class Pixels {
    width: number = 1;
    raw: Uint32Array = new Uint32Array(0);
}

export function texRepeat(gl: WebGLRenderingContext, tex_id: WebGLTexture) {
    gl.bindTexture(gl.TEXTURE_2D, tex_id);
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.REPEAT
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.REPEAT
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.NEAREST
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.NEAREST
    );
}

export function updateTextureFromPixels(
    gl: WebGLRenderingContext,
    tex: Texture,
    pixels: Pixels): void
{
    tex.width = pixels.width;
    tex.height = pixels.raw.length / pixels.width;
    gl.bindTexture(gl.TEXTURE_2D, tex.tex_id);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tex.width, tex.height,
        0, gl.RGBA,
        gl.UNSIGNED_BYTE, new Uint8Array(pixels.raw.buffer));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
}

export class TextureLoader {

    private cache: { [path: string]: {
        cbs: Array<(tex: Texture) => void>,
        tex: Texture
    }} = {};

    constructor(private gl: WebGLRenderingContext) {}

    loadSingleColorTexture(color: Uint8Array, cb: (tex: Texture) => void) {
        let gl = this.gl;
        let tex_id = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex_id);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,
            gl.UNSIGNED_BYTE, color);
        let tex = new Texture();
        tex.tex_id = tex_id;
        tex.width = 1;
        tex.height = 1;
        cb(tex);
    }

    loadTextureFromPixels(pixels: Pixels, cb: (tex: Texture) => void) {
        let gl = this.gl;
        let tex_id = gl.createTexture();
        let tex = new Texture();
        tex.tex_id = tex_id;
        updateTextureFromPixels(gl, tex, pixels);
        cb(tex);
    }

    loadTexture(path: string, cb: (tex: Texture) => void) {

        if (!(path in this.cache)) {

            // Prepare the texture fetch
            let img = new Image();
            let gl = this.gl;
            let tex_id = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex_id);
            // Fill the texture with a 1x1 blue pixel.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                          new Uint8Array([0, 0, 255, 255]));
            img.src = path;

            let isPowerOf2 = (value) => (value & (value - 1)) == 0;

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

                this.cache[path].tex = tex;

                for (let callback of this.cache[path].cbs) {
                    callback(tex);
                }
            };

            // Add to the cache our request:
            this.cache[path] = {
                cbs: [cb],
                tex: undefined
            };

        } else {
            if (this.cache[path].tex) {
                cb(this.cache[path].tex);
            } else {
                this.cache[path].cbs.push(cb);
            }
        }
    }
}
