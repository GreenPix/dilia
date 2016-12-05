"use strict";

const net = require('net');
const io = require('socket.io');

const server_port = 9010;
const lycan_port = 7777;

const lycan = net.connect({
    port: lycan_port,
});
const server = io(server_port, {
    path: '/',
});

let last_msg_received = '';

lycan.on('error', (err) => {
    if (err.code == 'ECONNREFUSED') {
        console.log('Could not connect to Lycan, is it currently running?');
    } else {
        console.log('Error on the Lycan socket: ', err);
    }
});

// The current protocol includes a 64 bit message size
// We should change it to 32 bit, but in the meantime just ignore the high part
// Forward messages from Lycan
let next_msg_size = null;
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
            // And forward it to the client
            server.send(message);
            // Reset the size (so we read it again next iteration)
            next_msg_size = null;
        } else {
            return;
        }
    }
});
lycan.on('close', () => {
    console.log('Connection with Lycan closed');
    console.log('Message that might be responsible from the error: '
        + last_msg_received
    );
    process.abort();
});


server.on('connection', (socket) => {

    // Once connected, forward messages from the client to Lycan
    socket.on('message', (message) => {

        let size = Buffer.byteLength(message, 'utf8');
        let buf = Buffer.allocUnsafe(size + 8);
        // Write the size of the message, followed by the message
        buf.writeUInt32LE(size, 0);
        buf.writeUInt32LE(0x0, 4);
        // Dirty double-copy
        Buffer.from(message).copy(buf, 8);
        last_msg_received = message;
        lycan.write(buf);
    });
});

server.on('error', (error) => {
    console.log(error);
});
