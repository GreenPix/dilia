import {Component, View, CORE_DIRECTIVES} from 'angular2/angular2';

let dialogTemplate = require<string>('./dialog.html');
let dialogCss = require<Webpack.Scss>('./dialog.scss');

@Component({
    selector: 'dialog-modal',
})
@View({
    templateUrl: dialogTemplate,
    styles: [dialogCss.toString()],
    directives: [CORE_DIRECTIVES]
})
export class Dialog {
    private is_shown: boolean;
    private is_visible: boolean;
    private timeid_shown: number;
    private timeid_visible: number;

    show() {
        this.clearAll();
        this.timeid_shown = setTimeout(() => {
            this.is_shown = true;
        }, 30);
        this.is_visible = true;
    }

    hide(event: Event) {
        if (event.defaultPrevented) {
            return;
        }
        this.clearAll();
        this.is_shown = false;
        this.timeid_visible = setTimeout(() => {
            this.is_visible = false;
        }, 500);
    }

    private clearAll() {
        clearTimeout(this.timeid_shown);
        clearTimeout(this.timeid_visible);
    }
}
