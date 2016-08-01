

function colors_noop(str) { return str; }

colors_noop.bold = colors_noop;
colors_noop.green = colors_noop;
colors_noop.yellow = colors_noop;
colors_noop.red = colors_noop;

module.exports.colors_noop = colors_noop;

module.exports.resolve_env = () => {
    switch (process.env.NODE_ENV) {
        case 'prod':
        case 'production': return 'prod';
        case 'dev':
        case 'development':
        default: return 'dev';
    }
};

module.exports.current_env = () => {
    return process.env.NODE_ENV == undefined ? '': process.env.NODE_ENV;
};
