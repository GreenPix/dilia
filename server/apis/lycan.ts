import {error as werror, info} from 'winston';
import {connect, Socket} from 'net';
import {config} from '../config';
import {app} from '../config/express';
import {AaribaScript} from '../db/schemas/aariba';
import {notFound} from './post_response_fmt';
import {LycanCommand, LycanMessage, Direction} from '../shared';
import {GameUpdate, ThisIsYou, Response, NewEntity, EntityHasQuit, Damage, Death} from '../shared';


const LYCAN_PORT = config().lycan_port;

interface DataPerSocket {
    lycan: Socket;
    last_msg_received: string;
}


// HTTP Apis

app.get('/api/lycan/aariba/latest', (req, res) => {
    AaribaScript.findOne({ name: 'combat.ab' }, (err, script) => {
        if (err || !script) {
            werror(err || '');
            notFound(res);
        } else {
            res.send(200, script.getLatest().content);
        }
    });
});


// Socket IO Apis

app.io().streaming<LycanCommand, DataPerSocket>('/api/lycan', (value, dps) => {
    if (!value) return;

    let serialized = serialize(value);

    let size = Buffer.byteLength(serialized, 'utf8');
    let buf = Buffer.allocUnsafe(size + 8);
    // Write the size of the message, followed by the message
    buf.writeUInt32LE(size, 0);
    buf.writeUInt32LE(0x0, 4);
    // Dirty double-copy
    Buffer.from(serialized).copy(buf, 8);
    dps.last_msg_received = serialized;
    dps.lycan.write(buf);

}, socket => {

    info("Attempting connection to client...");

    const lycan = connect({ port: LYCAN_PORT });
    let last_msg_received = '';

    lycan.on('error', (err) => {
        if ((err as any).code == 'ECONNREFUSED') {
            info('Could not connect to Lycan, is it currently running?');
        } else {
            info('Error on the Lycan socket: ', err);
        }
    });

    // The current protocol includes a 64 bit message size
    // We should change it to 32 bit, but in the meantime just ignore the high part
    // Forward messages from Lycan
    let next_msg_size: number | null = null;
    lycan.on('readable', () => {
        while (true) {
            // Parse the size first
            if (null === next_msg_size) {
                let buf;
                if (null !== (buf = lycan.read(8))) {
                    next_msg_size = buf.readUInt32LE(0);
                } else {
                    return;
                }
            }

            // Then get the actual message
            let buf;
            if (null !== (buf = lycan.read(next_msg_size))) {
                let message = buf.toString('utf-8', 0, next_msg_size);
                let parsed = parse(message);
                // And forward it to the client
                socket.send<LycanMessage>(parsed);
                // Reset the size (so we read it again next iteration)
                next_msg_size = null;
            } else {
                return;
            }
        }
    });
    lycan.on('close', () => {
        info('Connection with Lycan closed');
        info('Message that might be responsible from the error: '
            + last_msg_received
        );
    });

    return { lycan, last_msg_received };
});

interface RawLycanMessage {
    GameUpdate?: GameUpdate;
    ThisIsYou?: ThisIsYou;
    Response?: Response;
    NewEntity?: NewEntity;
    EntityHasQuit?: EntityHasQuit;
    Damage?: Damage;
    Death?: Death;
}

function parse(message: string): LycanMessage | undefined {
    let json: RawLycanMessage = JSON.parse(message);
    if (json.ThisIsYou) {
        let ret = json.ThisIsYou;
        ret.kind = 'ThisIsYou';
        return ret;
    }
    if (json.Response) {
        let ret = json.Response;
        ret.kind = 'Response';
        return ret;
    }
    if (json.NewEntity) {
        let ret = json.NewEntity;
        ret.kind = 'NewEntity';
        return ret;
    }
    if (json.GameUpdate) {
        let ret = json.GameUpdate;
        ret.kind = 'GameUpdate';
        return ret;
    }
    if (json.EntityHasQuit) {
        let ret = json.EntityHasQuit;
        ret.kind = 'EntityHasQuit';
        return ret;
    }
    if (json.Damage) {
        let ret = json.Damage;
        ret.kind = 'Damage';
        return ret;
    }
    if (json.Death) {
        let ret = json.Death;
        ret.kind = 'Death';
        return ret;
    }

    console.log(`Warning: could not parse ${message}`);
}

// TODO: Missing validation of properties
function serialize(command: Partial<LycanCommand>): string {
    let res: any;
    switch (command.kind) {
        case 'Authenticate': {
            res = {
                GameCommand: {
                    Authenticate: [command.guid, command.token],
                }
            };
            break;
        }

        case 'Walk': {
            // WHY did I take North/South/East/West? It is stupid ...
            // :D
            let direction: string | null = null;
            switch (command.direction) {
                case Direction.UP:
                    direction = 'North';
                    break;
                case Direction.DOWN:
                    direction = 'South';
                    break;
                case Direction.LEFT:
                    direction = 'West';
                    break;
                case Direction.RIGHT:
                    direction = 'East';
                    break;
            }
            res = {
                EntityOrder: {
                    entity: command.entity,
                    order: {
                        Walk: direction,
                    }
                }
            };
            break;
        }

        case 'Attack': {
            res = {
                EntityOrder: {
                    entity: command.entity,
                    order: 'Attack',
                }
            };
            break;
        }
    }
    return JSON.stringify(res);
}

