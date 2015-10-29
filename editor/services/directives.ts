
import {Directive, ElementRef} from 'angular2/angular2';
import {Component, View, NgStyle} from 'angular2/angular2';


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


export var SERVICE_DIRECTIVES = [
    AnimFadeIn,
    Tooltip
];
