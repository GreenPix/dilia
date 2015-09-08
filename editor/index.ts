
import {Component, View, bootstrap} from 'angular2/angular2';
import {Map} from './map/models';

@Component({
    selector: 'app'
})
@View({
    template: '<h1>{{ name }}</h1>'
})
class App {
    name: string;

    constructor() {
        this.name = "test";
    }
}

bootstrap(App);
