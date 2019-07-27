/*
  https://ultimatecourses.com/blog/writing-a-standalone-ajax-xhr-javascript-micro-library
  https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/
  https://blog.garstasio.com/you-dont-need-jquery/ajax/
  https://gomakethings.com/ajax-and-apis-with-vanilla-javascript/
  https://gist.github.com/sgnl/bd760187214681cdb6dd
*/

function Ajax(reqObj) {
  this.request = reqObj;
}

var parse = function (req) {
  var result;
  try {
    result = JSON.parse(req.responseText);
  } catch (e) {
    result = req.responseText;
  }
  return [result, req];
};

Ajax.request = function(options) {
  options = options || {};
  options.type = options.type || 'POST';
  options.contentType = options.contentType || 'application/x-www-form-urlencoded; charset=UTF-8';
  options.responseType = options.responseType || 'json';
  options.accept = options.accept || 'application/json, text/javascript, */*; q=0.01';
  options.responseType = options.responseType.toLowerCase();
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
  // var req;
  request.onreadystatechange = function () {
    var req;
    if (request.readyState === 4) {
      req = parse(request);
      if (request.status >= 200 && request.status < 300) {
        methods.success.call(methods, request, request.status, req[0]);
      } else {
        methods.error.call(methods, request, request.status, request.statusText);
      }
      methods.always.call(methods, request, request.status);

    }
  };
  if ((options.contentType.indexOf('json') > -1)) {
    try {
      options.data = JSON.stringify(options.data);
    } catch (e) {
      console.error(e);
    }
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

}

// Ajax.prototype.success = function(fn) {
//   const reqObj = Object.assign({}, this.request);
//   if (this.request.status >= 200 && this.request.status < 300) {
//     fn(this.request.req, this.request.status, this.request.req);
//   }
//   return new Ajax(reqObj);
// };
//
// Ajax.prototype.error = function(fn) {
//   const reqObj = Object.assign({}, this.request);
//   if (this.request.status < 200 || this.request.status >= 300) {
//     fn(this.request.req, this.request.status, this.request.req);
//   }
//   return new Ajax(reqObj);
// };
//
// Ajax.prototype.always = function(fn) {
//   const reqObj = Object.assign({}, this.request);
//   fn(this.request.req, this.request.status);
//   return new Ajax(reqObj);
// };

module.exports = Ajax;
