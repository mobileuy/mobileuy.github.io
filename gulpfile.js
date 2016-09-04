// -------------------------------------------
// Libraries gulp required.
// -------------------------------------------

var autoprefixer    = require('gulp-autoprefixer'),
    base64          = require('gulp-base64'),
    concat          = require('gulp-concat'),
    ejs             = require("gulp-ejs"),
    gulp            = require('gulp'),
    htmlmin         = require('gulp-htmlmin'),
    inlineimg       = require('gulp-inline-image-html'),
    minifycss       = require('gulp-minify-css'),
    open            = require('gulp-open'),
    plumber         = require('gulp-plumber'),
    runSequence     = require('run-sequence'),
    rename          = require('gulp-rename'),
    sass            = require('gulp-sass'),
    sourcemaps      = require('gulp-sourcemaps'),
    uglify          = require('gulp-uglify'),
    util            = require('gulp-util'),
    watch           = require('gulp-watch');


// -------------------------------------------
// Others libraries
// -------------------------------------------

var vinylPaths = require('vinyl-paths'),
          path = require('path'),
           del = require('del');


// -------------------------------------------
// General definitions.
// -------------------------------------------

var logger = util.log;


// -------------------------------------------
// General config
// -------------------------------------------

var config = {
  mainEjsFiles:   'app/views/**/!(_)*.ejs',
  ejsFiles:       'app/views/**/*.ejs',
  scriptFiles:    'app/assets/javascripts/**/*.js',
  scssFiles:      'app/assets/stylesheets/scss/**/*.scss',
  staticFiles:    'app/assets/static/**/*.*',
  scssMainFile:   'app/assets/stylesheets/scss/application.scss',
  imagesDir:      'app/assets/images',
  distPath:       'dist',
  tmpPath:        'tmp',
  outputCSS:      'mobileuy.css',
  outputCSSMin:   'mobileuy.min.css',
  outputJS:       'mobileuy.app.js'
};

config.cssOutputFilePath      = path.join(config.tmpPath, config.outputCSS);
config.outputJSFilePath       = path.join(config.tmpPath, config.outputJS);

config.base64 = {
  baseDir: config.imagesDir,
  extensions: ['png', 'svg', 'jpg', 'eot', 'woff2', 'woff', 'ttf'],
  maxImageSize: 10048 * 1024, // bytes
  debug: true
};


// -------------------------------------------
// Functions
// -------------------------------------------

var onError = function(error) {
  logger(error);
  this.emit('end');
};

var aliases = {};

/**
 * Will look for .scss|sass files inside the node_modules folder
 */
function npmModule(url, file, done) {
    // check if the path was already found and cached
    if(aliases[url]) {
        return done({ file:aliases[url] });
    }

    // look for modules installed through npm
    try {
        var newPath = path.relative('./app/assets/stylesheets/css', require.resolve(url));
        aliases[url] = newPath; // cache this request
        return done({ file:newPath });
    } catch(e) {
        // if your module could not be found, just return the original url
        aliases[url] = url;
        return done({ file:url });
    }
}


// -------------------------------------------
// Main Tasks
// -------------------------------------------

gulp.task('default', ['build', 'watch']);

gulp.task('build',  function() {
  runSequence('clean:tmp', 'script', 'html', 'sass', 'autoprefixer', 'copy:static', 'dist', 'open');
});

gulp.task('watch', function() {
    gulp.watch(config.staticFiles, ['copy:static']);
    gulp.watch(config.scriptFiles, ['compile:js']);
    gulp.watch(config.scssFiles, ['compile:css']);
    gulp.watch(config.ejsFiles, ['compile:html']);
});


// -------------------------------------------
// Watch Tasks
// -------------------------------------------

gulp.task('compile:css', function() {
  runSequence('sass', 'autoprefixer', 'dist');
});

gulp.task('compile:js', function() {
  runSequence('script', 'dist');
});

gulp.task('compile:html', function() {
    runSequence('html', 'dist');
});


// -------------------------------------------
// Clean Tasks
// -------------------------------------------

// Copy files from 'tmp' to 'dist'
gulp.task('dist', ['clean:dist'], function() {
    return gulp.src(path.join(config.tmpPath, '*'))
        .pipe(gulp.dest(config.distPath));
});

// Clean folder Dist
gulp.task('clean:dist', function() {
    return gulp.src(config.distPath)
        .pipe(vinylPaths(del));
});

// Clean folder tmp
gulp.task('clean:tmp', function() {
    return gulp.src(config.tmpPath)
        .pipe(vinylPaths(del));
});


// -------------------------------------------
// Tasks
// -------------------------------------------

// Compile js
gulp.task('script', function() {
    return gulp.src(config.scriptFiles)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat(config.outputJS))
        .pipe(uglify())
        .pipe(gulp.dest(config.tmpPath))
});

// Compile html
gulp.task('html', function() {
    return gulp.src(config.mainEjsFiles)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(ejs({
            title: "Mobile Day",
            jsFileName: config.outputJS,
            cssFileName: config.outputCSS
        }, { ext: ".html" }))
        .pipe(inlineimg(config.imagesDir))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(config.tmpPath));
});

// Compile sass.
gulp.task('sass', function() {
  return gulp.src(config.scssMainFile)
          .pipe(plumber({ errorHandler: onError }))
          .pipe(sass({ importer:npmModule, outputStyle: 'expanded' }))
          .pipe(rename(config.outputCSS))
          .pipe(base64(config.base64))
          .pipe(gulp.dest(config.tmpPath));
});

// Autoprefixer process.
gulp.task('autoprefixer', function() {
  return gulp.src(config.cssOutputFilePath)
          .pipe(plumber({ errorHandler: onError }))
          .pipe(autoprefixer(
            'last 2 version',
            'safari 5',
            'ie 8',
            'ie 9',
            'opera 12.1',
            'ios 6',
            'android 4'
          ))
          .pipe(gulp.dest(config.tmpPath));
});

gulp.task('copy:static', function() {
  return gulp.src(path.join(config.staticFiles))
      .pipe(gulp.dest(config.tmpPath));
});

gulp.task('open', function () {
    return gulp.src(path.join(config.distPath, 'index.html'))
        .pipe(open());
});
