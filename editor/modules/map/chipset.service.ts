import {Injectable} from '@angular/core';
import {HttpService, SocketIOService} from '../../services/index';
import {ChipsetData, ChipsetSocketNewAPI} from '../../shared';
import {getChipsetPah} from '../../models/chipset';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class ChipsetService {

    private raw_chipsets_list: string[] = [];
    private chipsets: BehaviorSubject<string[]> = new BehaviorSubject([]);

    constructor(
        private http: HttpService,
        io: SocketIOService
    ) {
        io.get<ChipsetSocketNewAPI>(`/api/chipset/new`)
          .map(x => [x.name])
          .merge(this.http.get('/api/chipset').map(res => res.json() as string[]))
          .subscribe(res => {
              this.raw_chipsets_list.push(...res);
              this.chipsets.next(this.raw_chipsets_list);
          });
    }

    getChipsetList(): Observable<string[]> {
        return this.chipsets;
    }

    getChipsetDetail(chipset_id: string): Observable<ChipsetData> {
        return this.http.get(`/api/chipset/${chipset_id}/metadata`)
            .map(res => res.json());
    }

    getChipsetPath(chipset_name: string): string {
        return getChipsetPah(chipset_name);
    }
}
