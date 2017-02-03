import * as sortedIndexBy from 'lodash/sortedIndexBy';

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {Vec2, length2} from '../../util/math';
import {LycanService} from './lycan.service';
import {Player} from './player';


interface Entity {
    pos: Vec2;
    id: number;
    next_pos: Vec2;
    nominal_speed: number;
    speed: Vec2;
}


@Injectable()
export class GameState {

    entities: Entity[] = [];

    // The player entity
    player: Entity;

    private count_changed = new BehaviorSubject<Entity[]>(this.entities);

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
                        nominal_speed: up.nominal_speed,
                        speed: { x: 0, y: 0 },
                        id: up.entity,
                    };
                    if (this.player_info.id === up.entity) {
                        this.player = entity;
                        this.player_info.nominal_speed = up.nominal_speed;
                    } else {
                        this.addNewEntity(entity);
                    }
                    break;
                case 'EntityHasQuit':
                    this.removeEntity(up.entity);
                    break;
                case 'GameUpdate':
                    let player_update;
                    for (let update of up.entities) {
                        if (update.entity_id === this.player.id) {
                            player_update = update;
                            continue;
                        }
                        let index = sortedIndexBy(
                            this.entities, {id: update.entity_id}, v => v.id
                        );
                        // tslint:disable-next-line:no-shadowed-variable
                        let entity = this.entities[index];
                        entity.next_pos = update.position;
                        entity.nominal_speed = length2(update.speed);
                    }
                    if (player_update) {
                        this.player.next_pos = player_update.position;
                        this.player_info.pos = player_update.position;
                    }
                    break;
            }
        });

    }

    getEntityCountChangedObservable(): Observable<Entity[]> {
        return this.count_changed;
    }

    private addNewEntity(entity: Entity) {
        let index = sortedIndexBy(
            this.entities, entity, v => v.id
        );
        if (index < this.entities.length && this.entities[index].id === entity.id) {
            return;
        }
        this.entities.splice(index, 0, entity);
        this.count_changed.next(this.entities);
    }

    private removeEntity(entity_id: number) {
        let index = sortedIndexBy(
            this.entities, {id: entity_id}, v => v.id
        );
        this.entities.splice(index, 1);
        this.count_changed.next(this.entities);
    }

}