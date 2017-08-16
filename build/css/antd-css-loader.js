module.exports = function (source) {
  source = source.replace(/(:global\s+)?(\.ant[\w-]+)(?!\))/g, ':global($2)');
  source = source.replace(/(:global\s+)?(\.has[\w-]+)(?!\))/g, ':global($2)');
  return source;
};
