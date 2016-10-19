'use strict';

const path = require('path');
const gulp = require('gulp');
const gutil = require('gulp-util');
const mocha = require('gulp-mocha');
const eslint = require('gulp-eslint');
const istanbul = require('gulp-istanbul');
const coveralls = require('gulp-coveralls');
const plumber = require('gulp-plumber');

const handleErr = (err) => {
  gutil.log(err.message);
  process.exit(1);
};

gulp.task('static', () => {
  return gulp.src([
      '**/*.js',
      '!node_modules/**',
      '!coverage/**'
    ])
    .pipe(eslint())
    .pipe(eslint.format())
    .on('error', handleErr);
});

gulp.task('pre-test', () => {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul({includeUntested: true}))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], (cb) => {
  let mochaErr;

  gulp.src(['test/**/*.js'])
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', (err) => {
      mochaErr = err;
    })
    .pipe(istanbul.writeReports())
    .on('end', () => {
      cb(mochaErr);
    });
});

gulp.task('coveralls', ['test'], () => {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});

gulp.task('default', ['static', 'test', 'coveralls']);
