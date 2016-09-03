import {Injectable} from '@angular/core';
import {HttpService} from '../../services/index';
import {ChipsetData} from '../../shared';
import {Observable} from 'rxjs';

@Injectable()
export class ChipsetService {

    constructor(private http: HttpService) {}

    getChipsetList(): Observable<string[]> {
        return this.http.get('/api/chipset/')
            .map(res => res.json());
    }

    getChipsetDetail(chipset_name: string): Observable<ChipsetData> {
        return this.http.get(`/api/chipset/${chipset_name}/metadata`)
            .map(res => res.json());
    }

    getChipsetPath(chipset_name: string): string {
        return `/api/chipset/${chipset_name}`;
    }
}
