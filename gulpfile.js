require('babel-register')({
	ignore: /(node_modules|nexus-flux\.js)/
});

var eslint = require('gulp-eslint');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var mocha = require('gulp-mocha');

function lint() {
  return gulp.src('src/**/*.js')
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format());
}

function test() {
  return gulp.src('src/__tests__/**/*.jsx')
    .pipe(mocha());
}

gulp.task('lint', lint);
gulp.task('test', ['lint'], test);
gulp.task('default', ['test']);
