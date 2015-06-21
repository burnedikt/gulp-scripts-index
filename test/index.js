'use strict';
var assert = require('assert');
var gulpScriptsIndex = require('../lib');
var gulp = require('gulp');
var gutil = require('gulp-util');

describe('gulp-scripts-index', function () {
  // expected array of scripts
  var expectedWithIE = [
    'modernizr-2.8.3.min.js',
    'jquery.min.js',
    'plugins.js',
    'main.js',
    'ie-specific.js'
  ];
  // expected array of scripts
  var expected = [
    'modernizr-2.8.3.min.js',
    'jquery.min.js',
    'plugins.js',
    'main.js'
  ];

  /**
   * function asserting that all scripts have been detected and added to the stream
   * @param  {Array}   files List of relative paths to scripts
   * @param  {Function} done
   */
  var assertWithoutIE = function(files, done) {
    // loop over the files and create a new array with just the relative paths
    var relatives = files.map(function(file) {
      return file.relative;
    });
    // now that we have the file list, perform some assertions
    assert.equal(relatives.length, expected.length, 'there should be ' + expected.length + ' referenced script (without IE scripts) in the input document');
    // make sure we got all expected scripts
    for (var i = expected.length - 1; i >= 0; i--) {
      assert.equal(relatives[i], expected[i], 'should have detected ' + expected[i]);
    }
    done();
  };

  var assertWithIE = function(files, done) {
    var expected = expectedWithIE;
    // loop over the files and create a new array with just the relative paths
    var relatives = files.map(function(file) {
      return file.relative;
    });
    // now that we have the file list, perform some assertions
    assert.equal(relatives.length, expected.length, 'there should be ' + expected.length + ' referenced script in the input document');
    // make sure we got all expected scripts
    for (var i = expected.length - 1; i >= 0; i--) {
      assert.equal(relatives[i], expected[i], 'should have detected ' + expected[i]);
    }
    done();
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
          console.error(err);
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
          console.error(err);
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
          console.error(err);
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
          console.error(err);
          assertWithIE(files, done);
        }));
    });
  });
});
