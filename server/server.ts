import {check} from './check';

// Check environment
check();

import {port} from './config/index';
import {server} from './config/express';
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
