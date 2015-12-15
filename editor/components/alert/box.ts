import {Component, View} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {HttpService} from '../../services/index';

@Component({
    selector: 'alert-box'
})
@View({
    template: `
        <div class="alert alert-{{alert_kind}}" role="alert"
            [ngStyle]="{ 'display': last_error ? 'block': 'none' }"
            >{{last_error}}
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"
              (click)="close()"
              ><span class="close-glyph glyphicon glyphicon-remove" aria-hidden="true"></span>
            </button>
        </div>
    `,
    directives: [CORE_DIRECTIVES]
})
export class AlertBox {

    // warning|success|danger|info
    alert_kind: string;
    last_error: string;

    constructor(private http: HttpService) {
        this.http.httpEvents().subscribe(ev => {
            this.last_error = ev.message;
            if (ev.errors) {
                let count = 0;
                for (let property in ev.errors) {
                    let message = ev.errors[property];
                    if (count === 0) {
                        this.last_error += ` :${message}`;
                    } else {
                        this.last_error += `, ${message}`;
                    }
                }
            }
            this.alert_kind = ev.kind === 'error' ? 'danger' : ev.kind;
        });
    }

    close() {
        this.last_error = null;
    }
}
