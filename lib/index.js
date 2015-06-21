'use strict';

var PLUGIN_NAME = require('../package.json').name;

//////////////////
// Dependencies //
//////////////////
// Streams!
var through = require('through2');
// HTML Parser
var htmlparser = require("htmlparser2");
// object merger (for options)
var merge = require("merge");
// vinyl file system
var vfs = require('vinyl-fs');
// path manipulation
var path = require('path');
// promises
var q = require('q');
// gulp helpers
var gutil = require('gulp-util');

module.exports = function(options) {
  // default config
  var defaults = {
    IE: false
  };
  // init variables to store all scripts
  var scripts = [];
  var skipScripts = false;
  var conditionalComentRegex = /\[if\s.*?\]>[\s\S]*<script[^>]*src="(.*)"[^>]*>\s*<\/script>[\s\S]*<!\[endif\]/gi;
  var outputStream;
  var scriptsPromises = [];
  // merge passed options with defaults
  options = merge(defaults, options);

  outputStream = through.obj(function(file, enc, callback) {
    /**
     * adds a script src to the output buffer
     * @param {String} src the script src
     */
    var _addScript = function(src) {
      // add the script src to the array of scripts
      scripts.push(src);
      // add the script to the output stream
      // create a promise which will be resolved as soon as the vfs has been read and its file has been pushed
      var deferred = q.defer();
      vfs.src([path.join(file.base, src)])
      // whenever the data event is ready, we will get a file (which can be pushed to the result stream)
      .on('data', function(file) {
        this.push(file);
      }.bind(this))
      // when an error occurs, make sure to pass it on to the promises
      .on('error', function(error) {
        this.emit('error', new gutil.PluginError(PLUGIN_NAME, error));
        deferred.reject(error);
      }.bind(this))
      // as soon as the file has been retrieved via the data event, the stream can be closed and our promise resolved
      .on('finish', function() {
        deferred.resolve();
      });
      // save the promise so later on we can wait for all of the streams to be finished
      scriptsPromises.push(deferred.promise);
    }.bind(this);

    // if there is no file, just skip
    if (file.isNull()) {
      console.log('hahahahahaha no file');
      return callback(null, file);
    }
    // create a new html parser and feed the stream / buffer into it to get out all scripts
    var parser = new htmlparser.Parser({
      oncomment: function(comment) {
        // if the IE options is set to true, we need to also identify scripts that only apply for IE
        // we can do so by looking at the conditional comments for IE and extracting the scripts in them
        // apply the regex to the comment to determine if we are looking at an IE conditional comment
        var regResult;
        if (options.IE && (regResult = conditionalComentRegex.exec(comment))) {
          // add the ie-specific script to the list of scripts
          _addScript(regResult[1]);
          // if we have one match, there might be others, so exec as often as possible
          while ((regResult = conditionalComentRegex.exec(comment))) {
            _addScript(regResult[1]);
          }
        }
      },
      onopentag: function(name, attribs) {
        // if we found a script (referenced via src attribute) add it to the list of scripts
        if (!skipScripts && name === "script" && attribs.src){
          _addScript(attribs.src);
        }
      },
      onend: function() {
        // as soon as everything has been parsed, add the found files to the stream
        // wait for all promises for all script files to be resolved and then close the stream
        q.all(scriptsPromises).then(function() {
          this.emit('end');
          callback();
        }.bind(this), function(error) {
          this.emit('error', error);
          callback();
        });
      }.bind(this)
    }, {decodeEntities: true});
    // otherwise we have a buffer or a stream, let's start with streams
    if (file.isStream()) {
      // feed the file content stream into the html parser, so we can get all scripts
      file.contents.pipe(parser);
    }
    // last and most simple case: Buffer
    if (file.isBuffer()) {
      // feed the contents of the buffer into the html parser, the rest is equal to the stream functionality
      parser.write(file.contents.toString());
      // after we fed everything into the parser, notify it that we're done
      parser.done();
    }
  });

  return outputStream;
};
