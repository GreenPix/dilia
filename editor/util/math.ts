export interface Vec2 {
    x: number;
    y: number;
}

export function length2(vec: Vec2): number {
    return vec.x * vec.x + vec.y * vec.y;
}

export function length(vec: Vec2): number {
    return Math.sqrt(length2(vec));
}

export function direction(origin: Vec2, dest: Vec2): Vec2 {
    let dir = { x: dest.x - origin.x, y: dest.y - origin.y };
    let len = length(dir);
    if (len > 1e-3) {
        dir.x = dir.x / len;
        dir.y = dir.y / len;
    }
    return dir;
}
