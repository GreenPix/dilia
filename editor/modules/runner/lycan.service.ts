import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {Subject} from 'rxjs/Subject';

import {Player} from './player';
import {LycanCommand, LycanMessage, Direction} from '../../shared';
import {LycanCommandAuthenticate, ThisIsYou, GameUpdate, LycanEntityUpdate} from '../../shared';
import {SocketIOService} from '../../services/index';


@Injectable()
export class LycanService {
    private input_stream: Subject<LycanMessage> = new Subject<LycanMessage>();
    private output_stream: Subject<LycanCommand> = new Subject<LycanCommand>();
    private output_sub: Subscription;

    constructor(
        private player: Player,
        private socket: SocketIOService
    ) {}

    connectToLycan() {
        this.output_sub = this.socket.dualStream<LycanCommand, LycanMessage | undefined>(
            '/api/lycan',
            this.output_stream
        ).subscribe(message => {
            if (message !== undefined) {
                this.input_stream.next(message);
            }
        });

        this.getUpdateStream()
            .filter(val => val.kind !== 'GameUpdate')
            // tslint:disable-next-line:no-console
            .subscribe(val => console.log(val));
    }

    reinitConnection(): void {
        this.sendRawCommand({ kind: 'InitConnection' });
    }

    authenticate() {
        let authenticate: LycanCommandAuthenticate = {
            kind: 'Authenticate',
            guid: '00000032-0000-0000-0000-000000000000',
            token: '50',
        };
        this.getUpdateStream()
            .filter(val => val.kind === 'ThisIsYou')
            .take(1)
            .subscribe(val => this.player.id = (val as ThisIsYou).entity);
        this.sendRawCommand(authenticate);
    }

    getUpdateStream(): Observable<LycanMessage> {
        return this.input_stream;
    }

    playerGameUpdateStream(): Observable<LycanEntityUpdate> {
        return this.input_stream.filter(val => val.kind === 'GameUpdate')
            .flatMap(up => (up as GameUpdate).entities)
            .filter(up => up.entity_id === this.player.id);
    }

    sendWalk(direction: Direction) {
        this.sendRawCommand({
            kind: 'Walk',
            entity: this.player.id,
            direction
        });
    }

    sendStopWalk() {
        this.sendRawCommand({
            kind: 'Walk',
            entity: this.player.id,
        });
    }

    sendRawCommand(command: LycanCommand) {
        this.output_stream.next(command);
    }
}

