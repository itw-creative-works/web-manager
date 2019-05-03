/*
  https://ultimatecourses.com/blog/writing-a-standalone-ajax-xhr-javascript-micro-library
  https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
  https://blog.garstasio.com/you-dont-need-jquery/ajax/
  https://gomakethings.com/ajax-and-apis-with-vanilla-javascript/
  https://gist.github.com/sgnl/bd760187214681cdb6dd
*/

const polyfills = require('./polyfills.js');

var parse = function (req) {
  var result;
  try {
    result = JSON.parse(req.responseText);
  } catch (e) {
    result = req.responseText;
  }
  return [result, req];
};

//   var xhr = function (type, url, data) {
var xhr = function (options) {
  options = options || {};
  options.type = options.type || 'POST';
  options.contentType = options.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
  options.responseType = options.responseType || 'json';
  options.accept = options.accept || 'application/json, text/javascript, */*; q=0.01';
  options.responseType.toLowerCase();
  options.data = options.data || {};

  if (!options.url) {
    return;
  }

  var methods = {
    success: function () {},
    error: function () {},
    always: function () {}
  };
  var XHR = window.XMLHttpRequest || XMLHttpRequest || ActiveXObject;
  var request = new XHR('MSXML2.XMLHTTP.3.0');

  request.open(options.type, options.url, true);
  request.setRequestHeader('Content-type', options.contentType);
  request.setRequestHeader('Accept', options.accept);
  request.onreadystatechange = function () {
    var req;
    if (request.readyState === 4) {
      console.log('REQUEST', request);
      req = parse(request);
      console.log('REQ', req);
      if (request.status >= 200 && request.status < 300) {
        methods.success.apply(methods, req);
      } else {
        methods.error.apply(methods, req);
      }
      methods.always.apply(methods, req);
    }
  };
  if ((options.contentType.indexOf('json') > -1)) {
    options.data = (typeof JSON === 'object' && typeof JSON.parse === 'function') ? JSON.stringify(options.data) : polyfills.stringify(options.data);
  }
  request.send(options.data);
  var atomXHR = {
    success: function (callback) {
      methods.success = callback;
      return atomXHR;
    },
    error: function (callback) {
      methods.error = callback;
      return atomXHR;
    },
    always: function (callback) {
      methods.always = callback;
      return atomXHR;
    }
  };

  return atomXHR;
};

module.exports = xhr;
