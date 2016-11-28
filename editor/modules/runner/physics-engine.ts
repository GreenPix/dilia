
interface Entity {
    pos: Vec2;
    next_pos: Vec2;
    nominal_speed: number;
    speed: Vec2;
}

interface Vec2 {
    x: number;
    y: number;
}

export class PhysicsEngine {

    // The list of entities except the player.
    private _entities: Entity[];

    // The player entity
    player: Entity;

    set entities(entities: Entity[]) {
        this._entities = entities;
    }

    update(dt: number) {
        // Update speed.
        for (let entity of this._entities) {
            let dir =  direction(entity.next_pos, entity.pos);
            entity.speed.x = entity.nominal_speed * dir.x / dt;
            entity.speed.y = entity.nominal_speed * dir.y / dt;
        }

        // Update positions
        let diff;
        for (let entity of this._entities) {

            diff = entity.next_pos.x - entity.pos.x;
            if (diff * (entity.speed.x * dt + entity.pos.x) < diff * diff) {
                entity.pos.x += entity.speed.x * dt;
            } else {
                entity.pos.x = entity.next_pos.x;
            }

            diff = entity.next_pos.y - entity.pos.y;
            if (diff * (entity.speed.y * dt + entity.pos.y) < diff * diff) {
                entity.pos.y += entity.speed.y * dt;
            } else {
                entity.pos.y = entity.next_pos.y;
            }
            entity.pos.y += entity.speed.y * dt;
        }
    }
}

function length2(vec: Vec2): number {
    return vec.x * vec.x + vec.y * vec.y;
}

function length(vec: Vec2): number {
    return Math.sqrt(length2(vec));
}

function direction(origin: Vec2, dest: Vec2): Vec2 {
    let dir = { x: dest.x - origin.x, y: dest.y - origin.y };
    let len = length(dir);
    if (len > 1e-3) {
        dir.x = dir.x / len;
        dir.y = dir.y / len;
    }
    return dir;
}
