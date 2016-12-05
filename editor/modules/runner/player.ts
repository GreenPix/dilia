import {Injectable} from '@angular/core';

@Injectable()
export class Player {

    health: number = 0;
    id: number;
    nominal_speed: number = 0;
    pos: { x: number, y: number } = { x: 0, y: 0 };
}
