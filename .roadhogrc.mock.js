'use strict';
const port = process.env.PORT || 8000;
const target = "http://localhost:"+port;
const getPath = (p)=>({target, pathRewrite: {[`^${p}`]: ""}});
const mock = {
  "/assets": { target },
  "/master": getPath("/master"),
  "/account": getPath("/account"),
  "/cash": getPath("/cash"),
};
require('fs')
  .readdirSync(require('path').join(__dirname + '/mock'))
  .filter(file=>file.endsWith('.js'))
  .filter(file=>!file.includes('plugin'))
  .forEach(function (file) {
    Object.assign(mock, require('./mock/' + file));
  });

export default mock;