import {Component, View, NgForm, ViewChild} from 'angular2/angular2';
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {Output, EventEmitter} from 'angular2/angular2';
import {HttpService} from '../../services/index';
import {SelectEl} from '../../services/directives';
import * as _ from 'lodash';

let autocompleteTemplate = require<string>('./autocomplete.html');
let autocompleteScss = require<Webpack.Scss>('./autocomplete.scss');


interface FileElement {
    name: string;
    locked: boolean;
}

@Component({
    selector: 'autocomplete-files'
})
@View({
    templateUrl: autocompleteTemplate,
    styles: [autocompleteScss.toString()],
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES, SelectEl]
})
export class AutocompleteFiles {

    private file_filtered: Array<FileElement> = [];
    private file_list: Array<FileElement> = [];
    private selected: FileElement = null;
    private selected_index: number = -1;
    private minlength: number = 3;
    private input_value: string;

    @ViewChild(NgForm)
    private form: NgForm;

    @ViewChild(SelectEl)
    private input_search: SelectEl;

    @Output() valid_selection: EventEmitter = new EventEmitter();

    constructor(private http: HttpService) {
        this.file_list.push({ name: 'hello world', locked: true });
        this.file_list.push({ name: 'test', locked: false });
        this.file_list.push({ name: 'aariba aariba !!', locked: true });
        this.selected = this.file_list[1];
        this.selected_index = 1;
    }

    onActivate() {
        this.file_list = [];
        this.http.get('/api/aariba')
            .map(res => res.json())
            .subscribe(res => {
                _.forEach(res, (properties: any, filename) => {
                    this.file_list.push({
                        name: filename,
                        locked: properties.is_locked,
                    });
                });
            });
    }

    afterViewInit() {
        (<any>this.form.control.valueChanges).toRx()
            .filter(_ => this.form.valid)
        // TODO: uncomment the code below once ReactiveX/RxJS#649 is solved
        //    .throttle(1)
           .subscribe(value => this.filterFiles(value.search));

        this.input_search.event<any>('keydown')
            .map<KeyboardEvent & { key: string }, string>(event => this.mapKeyCode(event))
            .filter(key => key !== null)
            .subscribe(key => this.processKey(key));
    }

    mapKeyCode(event: KeyboardEvent & { key: string }): string {
        let result: string = null;
        if (event.key !== undefined) {
            switch (event.key) {
                case 'ArrowDown': result = 'down';   break;
                case 'ArrowUp':   result = 'up';     break;
                case 'Escape':    result = 'escape'; break;
                case 'Enter':     result = 'enter';  break;
                // case 'ArrowLeft': result = 'left';  break;
                // case 'ArrowRight':result = 'right'; break;
            }
        } else if (event.keyCode !== undefined) {
            switch (event.keyCode) {
                case 13: result = 'enter';  break;
                case 27: result = 'escape'; break;
                // case 37: result = 'left'; break;
                case 38: result = 'up';     break;
                // case 39: result = 'right';  break;
                case 40: result = 'down';   break;
            }
        }
        if (result !== null) {
            event.preventDefault();
        }
        return result;
    }

    processKey(key: string): void {
        if (key === 'down') {
            this.selectBelow();
        }
        else if (key === 'up') {
            this.selectAbove();
        }
        else if (key === 'escape') {
            this.clearFocus();
        }
        else if (key === 'enter') {
            this.tryAcceptInput();
        }
    }

    isInputInvalid() {
        if (!this.input_search) return false;
        return this.input_value && this.input_value.length > this.minlength &&
            this.file_filtered.length === 0 &&
            this.input_search.getHtmlElement() === document.activeElement;
    }

    isInputValid() {
        return this.file_filtered.length > 0;
    }

    tryAcceptInput() {
        if (this.isInputValid()) {
            this.form.dirty = false;
            this.clearFocus();
            this.valid_selection.next(this.selected);
            this.input_value = '';
        }
    }

    filterFiles(name: string): void {
        this.file_filtered =
            _.filter(this.file_list, file => this.match(name, file.name));
        this.resetSelection();
    }

    clearFocus(): void {
        this.input_search.getHtmlElement().blur();
        this.file_filtered = [];
    }

    selectBelow(): void {
        this.selected_index = Math.min(this.file_filtered.length-1, this.selected_index + 1);
        this.selected = this.file_filtered[this.selected_index];
    }

    selectAbove(): void {
        this.selected_index = Math.max(0, this.selected_index - 1);
        this.selected = this.file_filtered[this.selected_index];
    }

    resetSelection(): void {
        this.selected_index = 0;
        this.selected = this.file_filtered[this.selected_index];
    }

    match(nameFrom: string, nameIn: string): boolean {
        return nameIn.indexOf(nameFrom) != -1;
    }
}
