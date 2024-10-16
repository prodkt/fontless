module.exports = function(source) {
  return `
module.exports = function(moduleArg) {
  var Module = moduleArg || {};
  (function() {
    ${source}
  })();
  return Module;
}`;
}