'use strict';

const docopt = require('docopt').docopt;
const colors = require('colors/safe');
const noop = require('./util').colors_noop;
const resolve_env = require('./util').resolve_env;
const current_env = require('./util').current_env;


let USAGE = (colors) => `
${colors.bold.green('Webpack build options')}

Those options allows to override the default values fetch using
the environment variable 'NODE_ENV'.

Your current value is:

    '${current_env()}'

Thus the environment will be:

    '${resolve_env()}'

The following options allows you to override this behavior.

${colors.bold.green('Usage:')}
  webpack [--prod | --dev | --uglify] [--bail] [--json]
  webpack --opt-help | --version

${colors.bold.green('Arguments:')}
  --bail                Fail the build if there's any compile error.
  --opt-help            Show this message.
  --version             Show the version of dilia.
  --prod                Start a production build.
  --uglify              Start a production build using uglify.
  --dev                 Start a dev environment.
  --test                Start a test environment.
`;

let options = docopt(USAGE(noop), {version: "1.0.0"});
let mode = process.env.NODE_ENV;

if (options['--opt-help']) {
    console.log(USAGE(colors));
    process.exit();
}

if (options['--prod']) {
  console.log(colors.bold("Start production build"));
  mode = 'prod';
} else if (options['--dev']) {
  console.log(colors.bold.yellow("Start development environment"));
  mode = 'dev';
} else if (options['--test']) {
  console.log(colors.bold.green("Start test environment"));
  mode = 'dev';
}



switch (mode) {
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
