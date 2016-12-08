import {Injectable} from '@angular/core';
import {HttpService, SocketIOService} from '../../services/index';
import {MapStatusExtra, MapSocketNewAPI} from '../../shared';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class MapService {

    private maps: BehaviorSubject<MapStatusExtra[]> = new BehaviorSubject([]);

    constructor(
        private http: HttpService,
        io: SocketIOService
    ) {
        io.get<MapSocketNewAPI>(`/api/maps/new`)
            .map(x => [x])
            .merge(this.http.get('/api/maps')
                .map(res => res.json() as MapStatusExtra[])
            ).subscribe(res => {
                this.maps.value.push(...res);
                this.maps.next(this.maps.value);
            });
    }

    getMapList(): Observable<MapStatusExtra[]> {
        return this.maps;
    }

    getMapPreview(map_id: string): string {
        return `/api/maps/${map_id}/preview`;
    }
}
