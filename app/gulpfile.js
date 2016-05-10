// -------------------------------------------
// Libraries gulp required.
// -------------------------------------------

var autoprefixer = require('gulp-autoprefixer'),
          base64 = require('gulp-base64');
           clean = require('gulp-clean'),
          concat = require('gulp-concat'),
            gulp = require('gulp'),
          header = require('gulp-header'),
       minifycss = require('gulp-minify-css'),
         plumber = require('gulp-plumber'),
     runSequence = require('run-sequence'),
          rename = require('gulp-rename'),
            sass = require('gulp-sass'),
      sourcemaps = require('gulp-sourcemaps'),
            util = require('gulp-util'),
          uglify = require('gulp-uglify');
          watch  = require('gulp-watch');

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
  scssFiles:      'assets/stylesheets/scss/**/*.scss',
  scssMainFile:   'assets/stylesheets/scss/application.scss',
  srcImages:      'public',
  distPath:       'public/dist',
  tmpPath:        'tmp',
  outputCSS:      'mobileuy.css',
  outputCSSMin:   'mobileuy.min.css',
  outputJS:       'mobileuy.app.js',
  outputJSVendor: 'mobileuy.vendor.js',
  scriptFiles:    'assets/javascripts/**/*.js',
  vendorFiles:    ['jquery']
};


config.mainFilePath    = path.join(config.tmpPath, config.outputCSS);
config.mainMinFilePath = path.join(config.tmpPath, config.outputCSSMin);
config.mainJSFilePath    = path.join(config.tmpPath, config.outputJS);
config.mainJSVendorFilePath    = path.join(config.tmpPath, config.outputJSVendor);
config.mainAllFilePath    = path.join(config.tmpPath, '*');
config.imagesDistPath  = path.join(config.distPath, 'images')

config.base64 = {
  baseDir: config.srcImages,
  extensions: ['png', 'svg', 'jpg', 'eot', 'woff2', 'woff', 'ttf'],
  maxImageSize: 10048 * 1024, // bytes
  debug: true
}

// -------------------------------------------
// Functions
// -------------------------------------------

var onError = function(error) {
  logger(error);
  this.emit('end');
}

var loadBowerComponents = function(source) {
  var bowerPath = 'bower_components';
  var arryLibs  = [];

  for (i = 0; i < source.length; i++) {
    var bowerJsonPath = './' + path.join('./',bowerPath, source[i], 'bower.json')
    var bowerJson = require(bowerJsonPath);
    var pathLib = path.join(bowerPath, source[i], bowerJson.main);
    console.log(pathLib);
    arryLibs.push(pathLib)
  }

  return arryLibs;
}

// -------------------------------------------
// Main Tasks
// -------------------------------------------

gulp.task('default', ['build', 'watch']);

gulp.task('build',  function(){
  runSequence('clean:tmp', 'script', 'vendor', 'sass', 'images',
              'autoprefixer', 'dist', 'minifycss', 'minifyjs');
});

gulp.task('compile:css', function(){
  runSequence('sass', 'images','autoprefixer', 'dist');
});

gulp.task('compile:js', function(){
  runSequence('script', 'vendor', 'dist');
});

// -------------------------------------------
// Tasks
// -------------------------------------------

// Compile sass.
gulp.task('sass', function() {
  return gulp.src(config.scssMainFile)
          .pipe(plumber({errorHandler: onError}))
          .pipe(sass({outputStyle: 'expanded'}))
          .pipe(rename(config.outputCSS))
          .pipe(gulp.dest(config.tmpPath));
});

// Autoprefixer process.
gulp.task('autoprefixer', function() {
  return gulp.src(config.mainFilePath)
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

// Copy files from 'tmp' to 'dist'
gulp.task('dist', ['clean:dist'], function(){
  return gulp.src(config.mainAllFilePath)
         .pipe(gulp.dest(config.distPath));
});

// Minify css
gulp.task('minifycss', function() {
  return gulp.src(config.mainFilePath)
          .pipe(plumber({ errorHandler: onError }))
          .pipe(sourcemaps.init())
          .pipe(minifycss({keepBreaks: true}))
          .pipe(rename({
              suffix: '.min'
          }))
          .pipe(sourcemaps.write())
          .pipe(gulp.dest(config.distPath))
});

// Compile js
gulp.task('script', function() {
  return gulp.src(config.scriptFiles)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat(config.outputJS))
    .pipe(gulp.dest(config.tmpPath))
});

// Compile js
gulp.task('vendor', function() {
  return gulp.src(loadBowerComponents(config.vendorFiles))
    .pipe(plumber({ errorHandler: onError }))
    .pipe(concat(config.outputJSVendor))
    .pipe(gulp.dest(config.tmpPath))
});

// Minify js
gulp.task('minifyjs', function() {
  return gulp.src([config.mainJSVendorFilePath, config.mainJSFilePath])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(uglify())
    .pipe(rename({
      basename: 'mobileuy',
      suffix: '.min'
    }))
    .pipe(gulp.dest(config.distPath))
});

// Clean folder Dist
gulp.task('clean:dist', function() {
  return gulp.src(config.distPath)
          .pipe(vinylPaths(del));
});

// Clean folder tmp
gulp.task('clean:tmp', function(){
  return gulp.src(config.tmpPath)
          .pipe(vinylPaths(del));
});

// Preprocess Images
gulp.task('images', function () {
    return gulp.src(config.mainFilePath)
            .pipe(base64(config.base64))
            .pipe(gulp.dest(config.tmpPath));
});

// Watch
gulp.task('watch', function() {
  gulp.watch(config.scriptFiles, ['compile:js']);
  gulp.watch(config.scssFiles, ['compile:css']);
});