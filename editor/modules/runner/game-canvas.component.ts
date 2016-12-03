import {Component, ViewChild} from '@angular/core';
import {AfterViewInit} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';

import {WebGLSurface} from '../../components';
import {MapManager, Map} from '../../models/map';

import {GameState} from './game-state';
import {LycanService} from './lycan.service';
import {GameInput} from './game-input';
import {PhysicsEngine} from './physics-engine';


let gameCanvasScss = require<Webpack.Scss>('./game-canvas.scss');

@Component({
    selector: 'game-canvas',
    styles: [gameCanvasScss.toString()],
    template: `<webgl-surface #surface></webgl-surface>`,
    providers: [
        LycanService,
        GameInput,
        PhysicsEngine,
        GameState,
    ]
})
export class GameCanvas implements AfterViewInit {

    @ViewChild('surface')
    private surface: WebGLSurface;
    private map: Map;

    constructor(
        private map_manager: MapManager,
        private route: ActivatedRoute,
        private location: Location,
        private state: GameState,
    ) {}

    goToPreviousView() {
        this.location.back();
    }

    ngAfterViewInit(): void {
        this.state.init(this.surface);
        this.route.params
        .switchMap(params => this.map_manager.openMap(params['mapid']))
        .subscribe(map => this.loadMap(map));
    }

    private loadMap(map: Map) {
        this.map = map;
        this.state.play(map);
    }
}
