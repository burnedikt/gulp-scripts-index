# gulp-scripts-index [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Input html file(s) and get a (ordered) stream of all referenced scripts which can then be used for further processing, like concatenation, minification or for testing


## Install

```sh
$ npm install --save-dev gulp-scripts-index
```

## Usage

### Simple Example

If you simply need all files that are referenced in the index.html and you don't want to use the excellent [useref](https://github.com/jonkemp/gulp-useref) for further processing it is as simple as:

```js
var gsi = require('gulp-scripts-index');

gulp.src(['index.html'])
	.pipe(gsi())
	.pipe(doSomethingElse())
	.pipe(gulp.dest('./'))
```

### Example Usage with Karma

It can be tedious to configure Karma with all required source files to run tests - in particular, when this information is already known, e.g. because all the script files are referenced in the index.html. In this case, it is quite easy to use `gulp-scripts-index` to parse the index.html and feed all required scripts to karma. For more information on running karma with gulp, please also refer to [karma-runner/gulp-karma](https://github.com/karma-runner/gulp-karma)

```js
var gsi = require('gulp-scripts-index');
// we will use the gutils to buffer all piped script files and output them as an array
var gutils = require('gulp-utils');
// obviously, we'll also need karma
var karma = require('karma.runner').server;

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
	gulp.src(['index.html'])
    .pipe(gsi({
        IE: false
    }))
    .pipe(gutil.buffer(function(err, files) {
      // files now contains a list of all references scripts in the index.html - in the right order to kick right off. However, it is still a list of vinyl file objects
      // let's reduce it to an array of strings
      files = files.map(function(file){return file.relative;})
      karma.start({
        configFile: __dirname + '/karma.conf.js',
        // pass in our detected script files - of course you will have to add your actual tests and / or mocks
        files: files.concat(['tests/unit/**.js', 'tests/mocks/**.js']),
        singleRun: true
      }, done);
    });
});
```

## Options

- `IE` {Boolean} - Defaults to `false`. Whether or not to also include scripts that are for IE only, i.e. they are surrounded by Conditional comments like so:

```html
<script src="main.js"></script>
<!--[if IE 9]>
	<script src="ie-specific.js"></script>
<![endif]-->
```

In the example above, if `IE` is set to true, the plugin will also pipe the `ie-specific.js` in addition to the `main.js`.

- `searchPaths` {Array} - Defaults to `[]`. this option can be used to specify additional locations in which to look for the script files referenced in index.html. That way, even files that are not stored at the actually specified location can be found and processed. The specified searchpaths are to be defined as relative to the process's cwd.

## License

MIT © [Benedikt Reiser]()


[npm-image]: https://badge.fury.io/js/gulp-scripts-index.svg
[npm-url]: https://npmjs.org/package/gulp-scripts-index
[travis-image]: https://travis-ci.org/burnedikt/gulp-scripts-index.svg?branch=master
[travis-url]: https://travis-ci.org/burnedikt/gulp-scripts-index
[daviddm-image]: https://david-dm.org/burnedikt/gulp-scripts-index.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/burnedikt/gulp-scripts-index
[coveralls-image]: https://coveralls.io/repos/burnedikt/gulp-scripts-index/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/burnedikt/gulp-scripts-index?branch=master