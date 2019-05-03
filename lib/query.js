/*
  https://github.com/medialize/URI.js/blob/gh-pages/src/URI.js

  https://github.com/ljharb/qs
  https://github.com/medialize/URI.js


*/
const polyfills = require('./polyfills.js');

var Query = (function() {

  /* start functions */
  function _parseQuery(url, options) {
    options = options || {};
    options.decode = (typeof options.decode === 'undefined') ? true : options.decode;
    url = (options.decode === true) ? decodeURIComponent(url) : url;
    var queryObject = {
      url: (url.indexOf('?') > -1) ? url.split("?")[0] : url,
      query: (url.indexOf('?') > -1) ? url.split("?")[1] : '',
      parameters: {},
      constructed: '',
    };
    queryObject.constructed = queryObject.url + '?' + queryObject.query;

    var params = {}, queries, temp, i, l;
    queryString = url.replace(/amp;/g,"");
    queries = (queryString.indexOf('?') > -1) ? queryString.split("?")[1].split("&") : [];
    for ( i = 0, l = queries.length; i < l; i++ ) {
      temp = queries[i].split('=');
      // params[temp[0]] = temp[1];
      // params[temp[0]] = decodeURIComponent(temp[1]);
      // params[temp[0]] = decodeURIComponent(temp[1]).replace(/\+/g, ' ');
      params[temp[0]] = (typeof temp[1] !== 'undefined') ? decodeURIComponent(temp[1]).replace(/\+/g, ' ') : "";
    };
    queryObject.parameters = params;
    return queryObject;
  };

  function _addQuery(queryObject, name, value) {
    queryObject = queryObject || {};
    queryObject.parameters = queryObject.parameters || {};
    queryObject.url = queryObject.url || '';
    queryObject.parameters[name] = value;
    var keys = polyfills.getObjectKeys(queryObject.parameters);
    queryObject.query = '';
    for (var i = 0; i < keys.length; i++) {
      queryObject.query = queryObject.query + (queryObject.query ? '&' : '') + keys[i] + '=' + queryObject.parameters[keys[i]];
    }
    queryObject.constructed = queryObject.url + '?' + queryObject.query;

  };
  /* end functions */

  return {
    parseQuery: _parseQuery,
    addQuery: _addQuery,
  };


})();

module.exports = Query;
