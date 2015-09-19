var plugins = require('gulp-load-plugins')();
var gulp = require('gulp');

var mode = process.env.NODE_ENV;

if (mode !== 'development' && mode !== 'production') {
  throw new Error("NODE_ENV needs to be set to either 'development' or 'production'.");
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



///////////////////////////////////////////////////////////
// Tasks details
//

function cp() {
  return gulp.src(ace.files.map(function (file) { return ace.folders[mode] + file; }))
    .pipe(plugins.concat('ace-min.js'))
    .pipe(gulp.dest('./public/js/'));
}
