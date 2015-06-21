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

  describe('in-streaming-mode', function () {
    it('should add all scripts in index.html to the stream', function (done) {
      // load the input.html file as a file stream
      gulp.src(['test/input/index.html'], {
        buffer: false
      })
        .pipe(gulpScriptsIndex({
          IE: false
        }))
        .pipe(gutil.buffer(function(err, files) {
          // loop over the files and create a new array with just the relative paths
          var relatives = files.map(function(file) {
            return file.relative;
          });
          // now that we have the file list, perform some assertions
          assert.equal(relatives.length, 4, 'there are 4 referenced script (without IE scripts) in the input document');
          // make sure we got all expected scripts
          for (var i = expected.length - 1; i >= 0; i--) {
            assert.equal(relatives[i], expected[i], 'should have detected ' + expected[i]);
          }
          done();
        }));
    });

    it('should add all scripts in index.html (including IE scripts) to the stream', function (done) {
      // load the input.html file as a file stream
      gulp.src(['test/input/index.html'], {
        buffer: false
      })
        .pipe(gulpScriptsIndex({
          IE: true
        }))
        .pipe(gutil.buffer(function(err, files) {
          var expected = expectedWithIE;
          // loop over the files and create a new array with just the relative paths
          var relatives = files.map(function(file) {
            return file.relative;
          });
          // now that we have the file list, perform some assertions
          assert.equal(relatives.length, 5, 'there are 5 referenced script in the input document');
          // make sure we got all expected scripts
          for (var i = expected.length - 1; i >= 0; i--) {
            assert.equal(relatives[i], expected[i], 'should have detected ' + expected[i]);
          }
          done();
        }));
    });
  });
});
