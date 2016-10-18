'use strict';
const should = require('should');
const gulpScriptsIndex = require('../lib');
const gulp = require('gulp');
const gutil = require('gulp-util');
const through = require('through2');

describe('gulp-scripts-index', function () {
  // expected array of scripts
  const expectedVanilla = [
    'test/input/vendor/modernizr-2.8.3.min.js',
    'test/input/vendor/jquery.min.js',
    'test/input/plugins.js'
  ];
  // expected array with specified search path
  const expectedWithSearchPath = expectedVanilla.slice(0);
  expectedWithSearchPath.push('test/input/searchpath/main.js');
  // expected array of scripts (everything in IE mode just without the ie-specific script)
  const expectedWithIE = expectedVanilla.slice(0);
  expectedWithIE.push('test/input/ie-specific.js');
  // expected array of scripts including both ie scripts and scripts from a different search path
  const expectedTotal = expectedWithSearchPath.slice(0);
  expectedTotal.push('test/input/ie-specific.js');

  /**
   * function asserting that all scripts have been detected and added to the stream
   * @param  {Array}   files List of relative paths to scripts
   * @param  {Function} done
   */
  const assertScriptsDetected = function (actual, expected, done) {
    try {
      // loop over the files and create a new array with just the relative paths
      const relatives = actual.map((file) => {
        return file.relative;
      });
      // now that we have the file list, perform some assertions
      relatives.should.have.length(expected.length);
      // make sure we got all expected scripts
      relatives.should.containDeepOrdered(expected);
      done();
    } catch (e) {
      done(e);
    }
  };

  describe('in-streaming-mode', function () {
    let inputStream;

    beforeEach(function (done) {
      // load the input.html file as a file stream
      inputStream = gulp.src(['test/input/index.html'], {
        buffer: false
      });
      done();
    });

    it('should add all scripts in index.html to the stream (without searchpath)', function (done) {
      inputStream
        .pipe(gulpScriptsIndex({
          IE: false
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedVanilla, done);
        }));
    });

    it('should add all scripts in index.html (including IE scripts) to the stream', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedWithIE, done);
        }));
    });

    it('should add also find scripts in a path specified via the searchPaths parameter', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: false,
          searchPaths: ['test/input/searchpath']
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedWithSearchPath, done);
        }));
    });

    it('should find all scripts (IE + scripts at specified searchpath + normal scripts)', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true,
          searchPaths: ['test/input/searchpath']
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedTotal, done);
        }));
    });
  });

  describe('in-buffer-mode', function () {
    let inputStream;

    beforeEach(function (done) {
      // load the input.html file as a file stream
      inputStream = gulp.src(['test/input/index.html']);
      done();
    });

    it('should add all scripts in index.html to the stream', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: false
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedVanilla, done);
        }));
    });

    it('should add all scripts in index.html (including IE scripts) to the stream', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedWithIE, done);
        }));
    });

    it('should add also find scripts in a path specified via the searchPaths parameter', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: false,
          searchPaths: ['test/input/searchpath']
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedWithSearchPath, done);
        }));
    });

    it('should find all scripts (IE + scripts at specified searchpath + normal scripts)', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true,
          searchPaths: ['test/input/searchpath']
        }))
        .pipe(gutil.buffer((err, files) => {
          assertScriptsDetected(files, expectedTotal, done);
        }));
    });
  });

  describe('error-handling', function () {
    it('should detect no script if no valid html file given', function (done) {
      // try to run plugin with non-existing html file
      gulp.src('test/input/not-existing.html')
        .pipe(gulpScriptsIndex())
        .pipe(gutil.buffer((err, files) => {
          files.should.have.length(0);
          done();
        }));
    });

    it('should detect no script if empty html file given', function (done) {
      // try to run plugin with empty html file
      gulp.src('test/input/index.html')
        .pipe(
          through.obj((file, enc, callback) => {
            // remove the contents
            file.contents = null;
            // also change the filename and fake the file as it was in the current directory
            file.path = 'null.html';
            file.base = './';
            // and proceed with the monified file
            callback(null, file);
          })
        )
        .pipe(gulpScriptsIndex())
        .pipe(gutil.buffer((err, files) => {
          try {
            // the piped file has no contents so it should just be returned without any processing
            files.should.have.length(1);
            should(files[0].relative).be.a.String().and.be.equal('null.html');
            done();
          } catch (e) {
            done(e);
          }
        }));
    });
  });
});
