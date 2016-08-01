var plugins = require('gulp-load-plugins')();
var gulp = require('gulp');


var mode = process.env.NODE_ENV;

if (mode !== 'development' && mode !== 'production') {
  console.log("NODE_ENV needs to be set to either 'development' or 'production'.");
  console.log("Falling back to 'development'");
  mode = 'development';
}

var ace = {
  folders: {
    'development': './node_modules/ace-builds/src/',
    'production': './node_modules/ace-builds/src-min/'
  },
  files: [
    'ace.js',
    'ext-language_tools.js'
  ]
}

plugins.help(gulp);

///////////////////////////////////////////////////////////
// Tasks Overview
//

gulp.task("copy", "Copy the files needed for libraries that are not loaded with webpack", cp);
gulp.task("lint", "Lint all typescript files using tslint", lint);


///////////////////////////////////////////////////////////
// Tasks details
//

function cp() {
  return gulp.src(ace.files.map(function (file) { return ace.folders[mode] + file; }))
    .pipe(plugins.concat('ace-min.js'))
    .pipe(gulp.dest('./public/js/'));
}

function lint() {
    return gulp.src([
            "editor/**/*.ts",
            "server/apis/**/*.ts",
            "server/config/*.ts",
            "server/db/**/*.ts",
            "server/server.ts",
            "server/resources.ts",
            "server/check.ts",
            "server/errors/**/*.ts"
        ])
        .pipe(plugins.tslint())
        .pipe(plugins.tslint.report("verbose", {
            emitError: false
        }));
}
