import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {Output, EventEmitter} from '@angular/core';
import {SocketIOService, HttpService} from '../../services/index';
import {AaribaFileList, AaribaFile} from '../../shared';
import {SelectEl} from '../../services/directives';
import {filter, sortBy, throttle} from 'lodash';

let autocompleteTemplate = require<string>('./autocomplete.html');
let autocompleteScss = require<Webpack.Scss>('./autocomplete.scss');


@Component({
    selector: 'autocomplete-files',
    templateUrl: autocompleteTemplate,
    styles: [autocompleteScss.toString()],
})
export class AutocompleteFiles {

    private file_filtered: Array<AaribaFile> = [];
    private file_list: Array<AaribaFile> = [];
    private selected: AaribaFile = null;
    private selected_index: number = -1;
    private minlength: number = 1;
    private input_value: string;

    @ViewChild(NgForm)
    private form: NgForm;

    @ViewChild(SelectEl)
    private input_search: SelectEl;

    @Output() openFile: EventEmitter<AaribaFile> = new EventEmitter<AaribaFile>();

    constructor(
        private io: SocketIOService,
        private http: HttpService
    ) {
        this.io.get<AaribaFile>('/api/aariba/new')
            .subscribe(f => this.file_list.push(f));

        this.io.get<AaribaFile>('/api/aariba/lock_status')
            .subscribe(fl => {
                let file = filter(this.file_list, f => f.name == fl.name);
                if (file.length > 0) file[0].locked = fl.locked;
            });

        this.http.get('/api/aariba')
            .map(res => res.json() as AaribaFileList)
            .subscribe(val => {
                this.file_list.push(...val);
            });
    }

    ngAfterViewInit() {
        let throttled = throttle(value => this.filterFiles(value.search), 10);
        this.form.control.valueChanges
            .filter(_ => this.form.valid &&
                this.input_search.getHtmlElement() === document.activeElement)
        // TODO: uncomment the code below once ReactiveX/RxJS#649 is solved
        //   .throttle(1)
           .subscribe(throttled);

        this.input_search.event<any>('keydown')
            .map((event: KeyboardEvent & { key: string }) => this.mapKeyCode(event))
            .filter(key => key !== null)
            .subscribe(key => this.processKey(key));

        this.openFile.subscribe(() => this.clearFocus());
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
        return (this.input_value || false) &&
            this.input_value.length > this.minlength &&
            this.file_filtered.length === 0 &&
            this.input_search.getHtmlElement() === document.activeElement;
    }

    isInputValid() {
        return this.file_filtered.length > 0;
    }

    tryAcceptInput() {
        if (this.isInputValid()) {
            this.openFile.next(this.selected);
        }
    }

    selectFile(file: AaribaFile) {
        this.selected = file;
        this.tryAcceptInput();
        this.resetSelection();
    }

    filterFiles(name: string): void {

        // Prepare the string.
        name = name.toLowerCase();

        // Filter by matching
        this.file_filtered = filter(this.file_list,
              file => this.match(name, file.name.toLowerCase()));

        // Sort by lexical order
        this.file_filtered = sortBy(this.file_filtered, 'name');

        // We limit the number of completions to 8,
        // we might want to always list everything but that still
        // doesn't seems ideal nor scalable
        this.file_filtered = this.file_filtered.slice(0, 8);
        this.resetSelection();
    }

    clearFocus(): void {
        this.input_search.getHtmlElement().blur();
        // Small hack to make it work. TODO: See what's wrong with the ng-model.
        setTimeout(() => {
            this.input_value = '';
        });
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
