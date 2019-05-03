/*
  https://gist.github.com/andrew8088/6f53af9579266d5c62c8
  https://stackoverflow.com/questions/8763125/get-array-of-objects-keys
*/

var Polyfills = (function() {

  /* start functions */
  function _stringify(obj) {
      if (typeof obj !== 'object' || obj === null || obj instanceof Array) {
          return value(obj);
      }

      return '{' + Object.keys(obj).map(function (k) {
          return (typeof obj[k] === 'function') ? null : '"' + k + '":' + value(obj[k]);
      }).filter(function (i) { return i; }) + '}';
  }

  function _getObjectKeys(obj) {
    var keys = [], i = 0;
    for (var key in obj) {
      keys.push(key);
    }
    return keys;
  }

  function value(val) {
      switch(typeof val) {
          case 'string':
              return '"' + val.replace(/\\/g, '\\\\').replace('"', '\\"') + '"';
          case 'number':
          case 'boolean':
              return '' + val;
          case 'function':
              return 'null';
          case 'object':
              if (val instanceof Date)  return '"' + val.toISOString() + '"';
              if (val instanceof Array) return '[' + val.map(value).join(',') + ']';
              if (val === null)         return 'null';
                                        return _stringify(val);
      }
  }
  /* end functions */

  return {
    stringify: _stringify,
    getObjectKeys: _getObjectKeys,
  };


})();

module.exports = Polyfills;
