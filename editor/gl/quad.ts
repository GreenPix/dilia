export function genQuadI(): number[] {
    return [0, 1, 2, 0, 2, 3];
}

export function genQuadData(
    x: number,
    y: number,
    w: number,
    h: number
): number[] {
    return [
            x, y,
        x + w, y,
        x + w, y + h,
            x, y + h
    ];
}
