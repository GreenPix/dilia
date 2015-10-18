import {check} from './check';

// Check environment
check();

import {port} from './config/index';
import {server, io} from './config/express';
import winston = require('winston');

// Log server info
winston.info(`Starting server in ${process.env.NODE_ENV} mode...`);

// Prepare mongodb configuration
require('./db/index');

// Register apis
require('./apis/index');

// Listen
server.listen(port, () => {
    winston.info(`Server listening on port: ${port}`);
});

io.on('connection', (socket) => {

    winston.info(`Client connected: ${socket.client}`);

    // Try obtaining the write access to the file
    socket.on('api:aariba:writemode', function () {
        console.log(arguments);
    });

    // Touch the file to maintain the lock
    socket.on('api:aariba:maintainlock', function () {
        console.log(arguments);
    });

    // Broadcast update to other people listening to file changes
    socket.on('api:aariba:update', function () {
    });

    socket.on('disconnected', () => {
        winston.info(`Client disconnected: ${socket.client}`);
    })
})
