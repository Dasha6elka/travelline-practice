const gulp = require('gulp');
const sass = require('gulp-sass');
const BrowserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');

function sync(done) {
  BrowserSync.init({
    server: {
      baseDir: 'dist'
    }
  });
  done();
}

function scss() {
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest('dist/css'))
    .pipe(BrowserSync.stream())
}

function js() {
  return gulp.src('src/js/**/*')
    .pipe(gulp.dest('dist/js'))
    .pipe(BrowserSync.stream());
}

function img() {
  return gulp.src('src/img/**/*')
    .pipe(gulp.dest('dist/img'))
    .pipe(BrowserSync.stream());
}

function icons() {
  return gulp.src('src/icons/**/*')
    .pipe(gulp.dest('dist/icons'))
    .pipe(BrowserSync.stream());
}

function html() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'))
    .pipe(BrowserSync.stream());
}

function watch() {
  gulp.watch('src/scss/**/*.scss', scss);
  gulp.watch('src/js/**/*.js', js);
  gulp.watch('src/**/*.html', html);
  gulp.watch('src/img/**/*', img);
  gulp.watch('src/icons/**/*', icons);
}

function clean(done) {
  del.sync('dist');
  done();
}

const build = gulp.series(clean, gulp.parallel(scss, js, html, img, icons));

exports.default = gulp.series(clean, build, sync, gulp.parallel(watch));