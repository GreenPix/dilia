import {Injectable} from '@angular/core';

import {direction} from '../../util/math';
import {GameState} from './game-state';



@Injectable()
export class PhysicsEngine {

    constructor(
        private world: GameState
    ) {}

    update(dt: number) {
        // Update speed.
        for (let entity of this.world.entities) {
            let dir =  direction(entity.pos, entity.next_pos);
            entity.speed.x = entity.nominal_speed * dir.x;
            entity.speed.y = entity.nominal_speed * dir.y;
        }

        // Update positions
        let diff;
        for (let entity of this.world.entities) {

            diff = entity.next_pos.x - entity.pos.x;
            if (entity.speed.x * dt < diff) {
                entity.pos.x += entity.speed.x * dt;
            } else {
                entity.pos.x = entity.next_pos.x;
            }

            diff = entity.next_pos.y - entity.pos.y;
            if (entity.speed.y * dt < diff) {
                entity.pos.y += entity.speed.y * dt;
            } else {
                entity.pos.y = entity.next_pos.y;
            }
        }
    }
}

