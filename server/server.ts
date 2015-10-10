import {check} from './check';

// Check environment
check();

import {port} from './config/index';
import {app} from './config/express';
import winston = require('winston');


winston.info(`Starting server in ${process.env.NODE_ENV} mode...`);

// Prepare mongodb configuration
require('./db/index');

// Register apis
require('./apis/index');

// Listen
app.listen(port, () => {
    winston.info(`Server listening on port: ${port}`);
});
