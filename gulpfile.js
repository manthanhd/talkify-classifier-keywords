/**
 * Created by manthanhd on 19/10/2016.
 */
const gulp = require('gulp');
const jslint = require('gulp-jshint');
const stylish = require('jshint-stylish');
const shell = require('gulp-shell');

gulp.task('lint', function () {
    return gulp.src(['./lib/**.js'])
        .pipe(jslint())
        .pipe(jslint.reporter(stylish));
});

gulp.task('test', shell.task('istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec'));

gulp.task('default', ['lint', 'test']);