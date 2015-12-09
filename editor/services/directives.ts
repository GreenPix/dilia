import {Directive, ElementRef} from 'angular2/angular2';
import {Component, View, NgStyle} from 'angular2/angular2';
import {Observable} from '@reactivex/rxjs';


@Directive({
    selector: '.fade-in',
})
export class AnimFadeIn {
    constructor(element: ElementRef) {
        element.nativeElement.style.opacity = 0;
        setTimeout(() => {
            element.nativeElement.style.opacity = 1;
        }, 5);
    }
}

@Component({
    selector: '[tooltip]',
    inputs: [
        'text: tooltip'
    ],
    host: {
      '(mouseover)': 'show()'
    }
})
@View({
    directives: [NgStyle],
    template: `<span class="tooltip bottom"
        [ng-style]="{'opacity': opacity}">{{text}}</span>`
})
class Tooltip {
    text: string;
    opacity: number;

    constructor(private element: ElementRef) {}

    show() {
        this.opacity = 0;
    }
}

@Directive({
    selector: '[select-this]'
})
export class SelectEl {

    constructor(private element: ElementRef) {}

    getHtmlElement(): HTMLElement {
        return this.element.nativeElement;
    }

    event<T>(fromEvent: string): Observable<T> {
        return Observable.fromEvent(this.element.nativeElement, fromEvent);
    }

    getInputElement(): HTMLInputElement {
        let el = this.getHtmlElement();
        if (el.tagName.toLowerCase() != 'input') {
          throw new Error('Not an input element.');
        }
        return <HTMLInputElement>el;
    }

    getCanvasHtmlElement(): HTMLCanvasElement {
        let el = this.getHtmlElement();
        if (el.tagName.toLowerCase() != 'canvas') {
          throw new Error('Not a canvas element.');
        }
        return <HTMLCanvasElement>el;
    }
}


export var SERVICE_DIRECTIVES = [
    AnimFadeIn,
    Tooltip,
    SelectEl
];
