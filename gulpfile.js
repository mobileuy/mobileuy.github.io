// -------------------------------------------
// Libraries gulp required.
// -------------------------------------------

var autoprefixer    = require('gulp-autoprefixer'),
    base64          = require('gulp-base64'),
    concat          = require('gulp-concat'),
    ejs             = require("gulp-ejs"),
    gulp            = require('gulp'),
    compass         = require('gulp-compass'),
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
  ejsFiles:       'app/views/!(_)*.ejs',
  scriptFiles:    'app/assets/javascripts/**/*.js',
  scssFiles:      'app/assets/stylesheets/scss/**/*.scss',
  scssMainFile:   'app/assets/stylesheets/scss/application.scss',
  distPath:       'dist',
  tmpPath:        'tmp',
  outputCSS:      'mobileuy.css',
  outputCSSMin:   'mobileuy.min.css',
  outputJS:       'mobileuy.app.js',
  outputJSVendor: 'mobileuy.vendor.js',
  vendorFiles:    ['jquery']
};

config.cssOutputFilePath      = path.join(config.tmpPath, config.outputCSS);
config.outputJSFilePath       = path.join(config.tmpPath, config.outputJS);
config.outputJSVendorFilePath = path.join(config.tmpPath, config.outputJSVendor);
config.base64 = {
  baseDir: 'app/assets/images',
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

var loadVendorComponents = function(source) {
  var node_path = 'node_modules';
  var libs  = [];

  for (i = 0; i < source.length; i++) {
    var jsonFilePath = './' + path.join('./', node_path, source[i], 'package.json');
    var json = require(jsonFilePath);
    var libsPath = path.join(node_path, source[i], json.main);
    console.log(libsPath);
    libs.push(libsPath)
  }

  return libs;
};


// -------------------------------------------
// Main Tasks
// -------------------------------------------

gulp.task('default', ['build', 'watch']);

gulp.task('build',  function() {
  runSequence('clean:tmp', 'script', 'vendor', 'html', 'sass',
      'autoprefixer', 'images', 'dist', 'open');
});

gulp.task('watch', function() {
    gulp.watch(config.scriptFiles, ['compile:js']);
    gulp.watch(config.scssFiles, ['compile:css']);
    gulp.watch(config.ejsFiles, ['compile:html']);
});


// -------------------------------------------
// Watch Tasks
// -------------------------------------------

gulp.task('compile:css', function() {
  runSequence('sass', 'images', 'autoprefixer', 'dist');
});

gulp.task('compile:js', function() {
  runSequence('script', 'vendor', 'dist');
});

gulp.task('compile:html', function() {
    runSequence('html', 'vendor', 'dist');
});


// -------------------------------------------
// Clean Tasks
// -------------------------------------------

// Copy files from 'tmp' to 'dist'
gulp.task('dist', ['clean:dist'], function(){
    return gulp.src(path.join(config.tmpPath, '*'))
        .pipe(gulp.dest(config.distPath));
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


// -------------------------------------------
// Tasks
// -------------------------------------------

// Compile js
gulp.task('script', function() {
    return gulp.src(config.scriptFiles)
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat(config.outputJS))
        .pipe(gulp.dest(config.tmpPath))
});

// Compile js
gulp.task('vendor', function() {
    return gulp.src(loadVendorComponents(config.vendorFiles))
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat(config.outputJSVendor))
        .pipe(gulp.dest(config.tmpPath))
});

// Compile html
gulp.task('html', function() {
    return gulp.src(config.ejsFiles)
        .pipe(plumber({errorHandler: onError}))
        .pipe(ejs({
            title: "MobileDay Uruguay",
            jsVendorFileName: config.outputJSVendor,
            jsFileName: config.outputJS,
            cssFileName: config.outputCSS
        }, { ext: ".html" }))
        .pipe(gulp.dest(config.tmpPath));
});

// Compile sass.
gulp.task('sass', function() {
  return gulp.src(config.scssMainFile)
          .pipe(plumber({errorHandler: onError}))
          .pipe(compass({
              config_file: path.join(__dirname, 'compass_config.rb'),
              project: path.join(__dirname, 'app', 'assets'),
              sass: 'stylesheets/scss',
              css: 'stylesheets/css'
          }))
          .pipe(sass({outputStyle: 'expanded'}))
          .pipe(rename(config.outputCSS))
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

// Preprocess Images
gulp.task('images', function () {
    return gulp.src(config.cssOutputFilePath)
        .pipe(base64(config.base64))
        .pipe(gulp.dest(config.tmpPath));
});

// Minify css
// gulp.task('minifycss', function() {
//   return gulp.src(config.cssOutputFilePath)
//           .pipe(plumber({ errorHandler: onError }))
//           .pipe(sourcemaps.init())
//           .pipe(minifycss({keepBreaks: true}))
//           .pipe(rename({
//               suffix: '.min'
//           }))
//           .pipe(sourcemaps.write())
//           .pipe(gulp.dest(config.distPath))
// });

// Minify js
//gulp.task('minifyjs', function() {
//  return gulp.src([config.outputJSVendorFilePath, config.outputJSFilePath])
//    .pipe(plumber({ errorHandler: onError }))
//    .pipe(uglify())
//    .pipe(rename({
//      basename: 'mobileuy',
//      suffix: '.min'
//    }))
//    .pipe(gulp.dest(config.distPath))
//});

gulp.task('open', function () {
    return gulp.src(path.join(config.distPath, 'index.html'))
        .pipe(open());
});
