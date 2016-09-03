
export function intoBase64(arr: Uint16Array): string {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(arr.buffer)));
}

export function fromBase64(content: string): Uint16Array {
    return new Uint16Array(new Uint8Array(atob(content).split('').map(
        c => c.charAt(0) as any as number
    )).buffer);
}
