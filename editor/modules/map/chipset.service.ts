import {Injectable} from '@angular/core';
import {HttpService} from '../../services/index';
import {ChipsetData} from '../../shared';
import {getChipsetPah} from '../../models/chipset';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ChipsetService {

    constructor(private http: HttpService) {}

    getChipsetList(): Observable<string[]> {
        return this.http.get('/api/chipset/')
            .map(res => res.json());
    }

    getChipsetDetail(chipset_id: string): Observable<ChipsetData> {
        return this.http.get(`/api/chipset/${chipset_id}/metadata`)
            .map(res => res.json());
    }

    getChipsetPath(chipset_name: string): string {
        return getChipsetPah(chipset_name);
    }
}
