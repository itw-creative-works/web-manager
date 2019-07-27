/*
  https://github.com/medialize/URI.js/blob/gh-pages/src/URI.js

  https://github.com/ljharb/qs
  https://github.com/medialize/URI.js


  static METHODS
  https://stackoverflow.com/questions/1535631/static-variables-in-javascript

*/

// const polyfill = require('./polyfills.js');

function Query(queryObj) {
  this.query = queryObj;
  constructQueryString(this);
}


Query.prototype.set = function(name, value) {
  var queryObj = Object.assign({}, this.query);
  queryObj.constructed.parameters[name] = value;
  queryObj.constructed.exists = (Object.keys(queryObj.constructed.parameters).length > 0);
  return new Query(queryObj);
}

Query.prototype.remove = function(name) {
  var queryObj = Object.assign({}, this.query);
  delete queryObj.constructed.parameters[name];
  queryObj.constructed.exists = (Object.keys(queryObj.constructed.parameters).length > 0);
  return new Query(queryObj);
}

Query.prototype.removeAll = function(name) {
  var queryObj = Object.assign({}, this.query);
  queryObj.constructed.parameters = {};
  queryObj.constructed.exists = false;
  return new Query(queryObj);
}

Query.prototype.get = function(name, def) {
  // return new Query(this.query.constructed.parameters[name]);
  return (this.query.constructed.parameters[name] || def);
}

Query.prototype.getAll = function() {
  // return new Query(this.query.constructed.parameters);
  return (this.query.constructed.parameters);
}

Query.prototype.getUrl = function() {
  // return new Query(this.query.constructed.parameters[name]);
  return (this.query.constructed.url);
}

Query.prototype.exists = function() {
  // return new Query(this.query.constructed.parameters[name]);
  return (this.query.constructed.exists);
}


Query.create = function(url, options) {
  options = options || {};
  options.decode = (typeof options.decode !== 'undefined') ? options.decode : true;
  url = url.replace(/amp;/g,"");
  url = (options.decode === true) ? decodeURIComponent(url) : url;
  var urlPlain = url.split('?')[0] || url;
  var t_params = getParameters(url);
  return new Query({
    original: {
      url: url,
      urlPlain: urlPlain,
      options: options || {},
    },
    constructed: {
      parameters: t_params,
      url: '',
      exists: (Object.keys(t_params).length > 0),
    },
  });
}

module.exports = Query;

function getParameters(url) {
  var params = {}, queries, temp, i, l;
  // queries = url.split('?')[1].split('&') || [];
  queries = url.split('?')[1];
  queries = (queries) ? queries.split('&') : [];
  for ( i = 0, l = queries.length; i < l; i++ ) {
    temp = queries[i].split('=');
    params[temp[0]] = temp[1];
    // params[temp[0]] = (typeof temp[1] !== 'undefined') ? temp[1].replace(/\+/g, ' ') : "";
  };
  return params;
}

function constructQueryString(obj) {
  obj.query.constructed.url = obj.query.original.urlPlain;
  var i = 0;
  for (var key in obj.query.constructed.parameters) {
    var url = obj.query.constructed.url;
    var value = obj.query.constructed.parameters[key];
    obj.query.constructed.url = url + (i == 0 ? '?' : '&') + key + '=' + value;
    i++;
  }
}
