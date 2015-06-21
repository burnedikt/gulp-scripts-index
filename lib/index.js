'use strict';

var PLUGIN_NAME = require('../package.json').name;

//////////////////
// Dependencies //
//////////////////
// Streams!
var through = require('through2');
// HTML Parser
var htmlparser = require('htmlparser2');
// object merger (for options)
var merge = require('merge');
// vinyl file system
var vfs = require('vinyl-fs');
// gulp helpers
var gutil = require('gulp-util');
// array helper
var array = require('array-extended');
// path manipulation
var path = require('path');

module.exports = function(options) {
  // default config
  var defaults = {
    IE: false,
    searchPaths: []
  };
  // init variables to store all scripts
  var scripts = [];
  var skipScripts = false;
  var conditionalComentRegex = /\[if\s.*?\]>[\s\S]*<script[^>]*src="(.*)"[^>]*>\s*<\/script>[\s\S]*<!\[endif\]/gi;
  var outputStream;
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
    };

    // if there is no file, just skip
    if (file.isNull()) {
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
        if (!skipScripts && name === 'script' && attribs.src){
          _addScript(attribs.src);
        }
      },
      onend: function() {
        // as soon as everything has been parsed, add the found files to the stream
        // add the script to the output stream
        // look for scripts in all available search paths. Available search paths are:
        // - The file.base folder (i.e. the folder in which the index.html lies)
        // - any other specified folders (options.searchPaths)
        var searchPaths = array.union([file.base], options.searchPaths.map(function(sp) {
          return path.join(process.cwd(), sp);
        }));
        var scriptsGlob = [];
        scripts.forEach(function(glob) {
          scriptsGlob = scriptsGlob.concat(searchPaths.map(function(searchPath) {
            return path.join(searchPath, glob);
          }));
        });
        vfs.src(scriptsGlob, {
          cwd: file.base,
          base: '.',
          // we want to keep the order as specified in the index.html
          nosort: true,
          // do not match directories, just files, since we want to pipe those
          nodir: true
        })
        // whenever the data event is ready, we will get a file (which can be pushed to the result stream)
        .on('data', function(file) {
          this.push(file);
        }.bind(this))
        // when an error occurs, make sure to pass it on to the promises
        .on('error', function(error) {
          this.emit('error', new gutil.PluginError(PLUGIN_NAME, error));
          callback(error);
        }.bind(this))
        // as soon as the file has been retrieved via the data event, the stream can be closed and our promise resolved
        .on('finish', function() {
          this.emit('end');
          // we're done with this file. Let's go to the next
          callback();
        }.bind(this));
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
