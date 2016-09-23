import {Injectable} from '@angular/core';
import {HttpService} from '../../services/index';
import {MapStatusExtra, MapData} from '../../shared';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class MapService {

    constructor(private http: HttpService) {}

    getMapList(): Observable<MapStatusExtra[]> {
        return this.http.get('/api/maps/')
            .map(res => res.json());
    }

    getMapPreview(map_id: string): string {
        return `/api/maps/${map_id}/preview`;
    }

    getMapDetail(map_id: string): Observable<MapData> {
        return this.http.get(`/api/maps/${map_id}`)
            .map(res => res.json());
    }
}
