var config = {
    contentType: 'application/x-www-form-urlencoded'
  };

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
    options.contentType = options.contentType || 'application/x-www-form-urlencoded';
    options.responseType = options.responseType || 'json';
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
    var XHR = XMLHttpRequest || ActiveXObject;
    var request = new XHR('MSXML2.XMLHTTP.3.0');

    request.open(options.type, options.url, true);
    request.setRequestHeader('Content-type', options.contentType);
    request.onreadystatechange = function () {
      var req;
      if (request.readyState === 4) {
        req = parse(request);
        if (request.status >= 200 && request.status < 300) {
          methods.success.apply(methods, req);
        } else {
          methods.error.apply(methods, req);
        }
        methods.always.apply(methods, req);
      }
    };
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

xhr({
  type: 'POST',
  url: 'https://api.slapform.com/ian.wiedenman@gmail.com',
  contentType: "application/json", // application/x-www-form-urlencoded | application/json
  // responseType: "json",
  data: {
    name: "Jon Snow"
  },
})
.success(function (data, two, three, four) {
  console.log('SUCCESS>');
  console.log(data, two, three, four);
})
.error(function (data, two, three, four) {
  console.log('FAIL>');
  console.log(data, two, three, four);
});
// xhr('POST','https://testt.free.beeceptor.com', {test: 'test'})
// xhr('POST','https://api.slapform.com/ian.wiedenman@gmail.com', {test: 'test'})
// .success(function (data, two, three, four) {
//   console.log('SUCCESS>');
//   console.log(data, two, three, four);
// })
// .error(function (data, two, three, four) {
//   console.log('FAIL>');
//   console.log(data, two, three, four);
// });
console.clear();
