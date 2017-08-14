'use strict';

const mock = {};
require('fs')
  .readdirSync(require('path').join(__dirname + '/mock'))
  .filter(file=>file.endsWith('.js'))
  .filter(file=>!file.includes('plugin'))
  .forEach(function (file) {
    Object.assign(mock, require('./mock/' + file));
  });

export default mock;