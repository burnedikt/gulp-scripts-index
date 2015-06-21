'use strict';
var should = require('should');
var gulpScriptsIndex = require('../lib');
var gulp = require('gulp');
var gutil = require('gulp-util');
var through = require('through2');

describe('gulp-scripts-index', function () {
  // expected array of scripts
  var expectedWithIE = [
    'test/input/vendor/modernizr-2.8.3.min.js',
    'test/input/vendor/jquery.min.js',
    'test/input/plugins.js',
    'test/input/main.js',
    'test/input/ie-specific.js'
  ];
  // expected array of scripts (everything in IE mode just without the ie-specific script)
  var expected = expectedWithIE.slice(0, -1);

  /**
   * function asserting that all scripts have been detected and added to the stream
   * @param  {Array}   files List of relative paths to scripts
   * @param  {Function} done
   */
  var assertWithoutIE = function(files, done) {
    try {
      // loop over the files and create a new array with just the relative paths
      var relatives = files.map(function(file) {
        return file.relative;
      });
      // now that we have the file list, perform some assertions
      relatives.should.have.length(expected.length);
      // make sure we got all expected scripts
      relatives.should.containDeepOrdered(expected);
      done();
    } catch(e) {
      done(e);
    }
  };

  /**
   * function asserting that all scripts have been detected and added to the stream (including IE scripts)
   * @param  {Array}   files List of relative paths to scripts
   * @param  {Function} done
   */
  var assertWithIE = function(files, done) {
    try {
      // loop over the files and create a new array with just the relative paths
      var relatives = files.map(function(file) {
        return file.relative;
      });
      // now that we have the file list, perform some assertions
      relatives.should.have.length(expectedWithIE.length);
      // make sure we got all expected scripts
      relatives.should.containDeepOrdered(expectedWithIE);
      done();
    } catch(e) {
      done(e);
    }
  };

  describe('in-streaming-mode', function () {
    var inputStream;

    beforeEach(function(done) {
      // load the input.html file as a file stream
      inputStream = gulp.src(['test/input/index.html'], {
        buffer: false
      });
      done();
    });

    it('should add all scripts in index.html to the stream', function (done) {
      inputStream
        .pipe(gulpScriptsIndex({
          IE: false
        }))
        .pipe(gutil.buffer(function(err, files) {
          assertWithoutIE(files, done);
        }));
    });

    it('should add all scripts in index.html (including IE scripts) to the stream', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true
        }))
        .pipe(gutil.buffer(function(err, files) {
          assertWithIE(files, done);
        }));
    });
  });

  describe('in-buffer-mode', function () {
    var inputStream;

    beforeEach(function(done) {
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
        .pipe(gutil.buffer(function(err, files) {
          assertWithoutIE(files, done);
        }));
    });

    it('should add all scripts in index.html (including IE scripts) to the stream', function (done) {
      // load the input.html file as a file stream
      inputStream
        .pipe(gulpScriptsIndex({
          IE: true
        }))
        .pipe(gutil.buffer(function(err, files) {
          assertWithIE(files, done);
        }));
    });
  });

  describe('error-handling', function () {
    it('should detect no script if no valid html file given', function (done) {
      // try to run plugin with non-existing html file
      gulp.src('test/input/not-existing.html')
        .pipe(gulpScriptsIndex())
        .pipe(gutil.buffer(function(err, files) {
          files.should.have.length(0);
          done();
        }));
    });

    it('should detect no script if no empty html file given', function (done) {
      try {
        // try to run plugin with empty html file
        var inputStream = gulp.src('');
        inputStream .push(new File({
          path: 'empty.html',
          contents: null
        }));
        inputStream
          .pipe(gutil.buffer(function(err, files) {
            console.log(files, err);
          }))
          .pipe(gulpScriptsIndex())
          .pipe(gutil.buffer(function(err, files) {
            files.should.have.length(0);
            done();
          }));
      } catch(e) {
        done(e);
      }
    });
  });
});
