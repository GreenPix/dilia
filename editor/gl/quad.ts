export function genQuadI(): Array<number> {
    return [0, 1, 2, 0, 2, 3];
}

export function genQuadData(
    x: number,
    y: number,
    w: number,
    h: number
): Array<number> {
    return [
            x, y,
        x + w, y,
        x + w, y + h,
            x, y + h
    ];
}
