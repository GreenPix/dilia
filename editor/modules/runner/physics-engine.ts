import {Injectable} from '@angular/core';
import * as sortedIndexBy from 'lodash/sortedIndexBy';
import {LycanService} from './lycan.service';
import {Player} from './player';

interface Entity {
    pos: Vec2;
    id: number;
    next_pos: Vec2;
    nominal_speed: number;
    speed: Vec2;
}

interface Vec2 {
    x: number;
    y: number;
}

@Injectable()
export class PhysicsEngine {

    // The list of entities except the player.
    private entities: Entity[] = [];

    // The player entity
    private player: Entity;

    constructor(
        private lycan: LycanService,
        private player_info: Player
    ) {
        this.lycan.getUpdateStream().subscribe(up => {
            switch (up.kind) {
                case 'NewEntity':
                    let entity: Entity = {
                        pos: up.position,
                        next_pos: up.position,
                        nominal_speed: 0,
                        speed: { x: 0, y: 0 },
                        id: up.entity,
                    };
                    if (this.player_info.id == up.entity) {
                        this.player = entity;
                    } else {
                        let index = sortedIndexBy(
                            this.entities, entity, v => v.id
                        );
                        this.entities.splice(index, 0, entity);
                    }
                    break;
                case 'EntityHasQuit':
                    let index = sortedIndexBy(
                        this.entities, {id: up.entity}, v => v.id
                    );
                    this.entities.splice(index, 1);
                    break;
                case 'GameUpdate':
                    let player_update;
                    for (let update of up.entities) {
                        if (update.entity_id == this.player.id) {
                            player_update = update;
                            continue;
                        }
                        let index = sortedIndexBy(
                            this.entities, {id: update.entity_id}, v => v.id
                        );
                        let entity = this.entities[index];
                        entity.next_pos = update.position;
                        entity.nominal_speed = length2(update.speed);
                    }
                    if (player_update) {
                        this.player.next_pos = player_update.position;
                    }
                    break;
            }
        });
    }

    update(dt: number) {
        // Update speed.
        for (let entity of this.entities) {
            let dir =  direction(entity.next_pos, entity.pos);
            entity.speed.x = entity.nominal_speed * dir.x / dt;
            entity.speed.y = entity.nominal_speed * dir.y / dt;
        }

        // Update positions
        let diff;
        for (let entity of this.entities) {

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
