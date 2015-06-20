# gulp-scripts-index [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Input html file(s) and get a stream of all referenced scripts which can then be used for further processing, like concatenation, minification or for testing


## Install

```sh
$ npm install --save gulp-scripts-index
```


## Usage

```js
var gulpScriptsIndex = require('gulp-scripts-index');

gulpScriptsIndex('Rainbow');
```

## License

MIT © [Benedikt Reiser]()


[npm-image]: https://badge.fury.io/js/gulp-scripts-index.svg
[npm-url]: https://npmjs.org/package/gulp-scripts-index
[travis-image]: https://travis-ci.org//gulp-scripts-index.svg?branch=master
[travis-url]: https://travis-ci.org//gulp-scripts-index
[daviddm-image]: https://david-dm.org//gulp-scripts-index.svg?theme=shields.io
[daviddm-url]: https://david-dm.org//gulp-scripts-index
[coveralls-image]: https://coveralls.io/repos//gulp-scripts-index/badge.svg
[coveralls-url]: https://coveralls.io/r//gulp-scripts-index
