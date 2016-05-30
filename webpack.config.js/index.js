switch (process.env.NODE_ENV) {
    case 'prod':
    case 'production':
        module.exports = require('./prod.js');
        break;
    case 'test':
        module.exports = require('./test.js');
    case 'dev':
    case 'development':
    default:
        module.exports = require('./dev.js');
}
