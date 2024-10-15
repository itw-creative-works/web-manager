/*
*/

var shadow;

function Utilities(utilObj) {
  this.utilities = utilObj;
}

Utilities.get = function (object, path, defaultValue) {
  // If the path is not defined or it has false value
  if (!path) {
    return defaultValue;
  }

  // Check if the path is a string or array. If it is a string, convert it to array
  const pathArray = Array.isArray(path) ? path : path.split('.');

  // For each item in the path, dig into the object
  let currentObject = object;
  for (const key of pathArray) {
    if (!currentObject || currentObject[key] === undefined) {
      return defaultValue;
    }
    currentObject = currentObject[key];
  }

  // Return the value
  return currentObject === undefined ? defaultValue : currentObject;
}

/* https://stackoverflow.com/questions/54733539/javascript-implementation-of-lodash-set-method */
Utilities.set = function (obj, path, value) {
  if (Object(obj) !== obj) {
    return obj;
  }; // When obj is not an object

  var p = (path || '').split("."); // Get the keys from the path

  p.slice(0, -1).reduce(function (a, c, i) {
    return (// Iterate all of them except the last one
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
      // Yes: then follow that path
      ? a[c] // No: create the key. Is the next key a potential array-index?
      : a[c] = Math.abs(p[i + 1]) >> 0 === +p[i + 1] ? [] // Yes: assign a new array object
      : {}
    );
  }, // No: assign a new plain object
  obj)[p.pop()] = value; // Finally assign the value to the last key

  return obj; // Return the top-level object to allow chaining
}

/* https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf */
// Utilities.getLegacy = function (obj, path, def) {
//   if (!path) {
//     return def;
//   }
//   var fullPath = (path || '')
//     .replace(/\[/g, '.')
//     .replace(/]/g, '')
//     .split('.')
//     .filter(Boolean);

//   return fullPath.every(everyFunc) ? obj : def;

//   function everyFunc(step) {
//     // return !(step && (obj = obj[step]) === undefined);
//     // console.log(' CHECK > ', !(step && (obj = obj[step]) === undefined));
//     // console.log('step', step, 'obj', obj, 'objstep', obj[step]);
//     // return !(step && (obj = obj[step]) === undefined);
//     return !(step && (obj = obj[step]) === undefined);
//   }
// }

// https://dzone.com/articles/cross-browser-javascript-copy-and-paste
// https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
Utilities.clipboardCopy = function (input) {
  var el = document.createElement('textarea');
  el.setAttribute('style','width:1px;border:0;opacity:0;');
  el.value = input && input.nodeType ? input.value || input.innerText || input.innerHTML : input;
  document.body.appendChild(el);
  el.select();
  try {
    document.execCommand('copy');
  } catch (e) {
    alert('Please press Ctrl/Cmd+C to copy');
  }
  document.body.removeChild(el);
}

// Escape HTML
// https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
// Utilities.escapeHTML = function (str) {
//   shadow = shadow || document.createElement('div');
//   shadow.textContent = str;

//   return shadow.textContent.replace(/["']/g, function(m) {
//     switch (m) {
//       case '"':
//         return '&quot;';
//       default:
//         return '&#039;';
//     }
//   });
// }

Utilities.escapeHTML = function (str) {
  shadow = shadow || document.createElement('p');
  shadow.innerHTML = '';

  // This automatically escapes HTML entities like <, >, &, etc.
  shadow.appendChild(document.createTextNode(str));

  // This is needed to escape quotes to prevent attribute injection
  return shadow.innerHTML.replace(/["']/g, function(m) {
    switch (m) {
      case '"':
        return '&quot;';
      default:
        return '&#039;';
    }
  });
}

Utilities.getContext = function () {
  // Check mobile
  function mobile() {
    try {
      var m = navigator.userAgentData.mobile;
      return typeof m === 'undefined' ? _THROW : m === true;
    } catch (e) {
      try {
        // return window.matchMedia('only screen and (max-width: 767px)').matches;
        return window.matchMedia('(max-width: 767px)').matches;
      } catch (e) {
        return false;
      }
    }
  }

  // Return findings
  return {
    client: {
      mobile: mobile(),
    },
  }
}

// Navigate fn that takes a url and an object of query params
Utilities.navigate = function (url, params) {
  // Should work if the url is a relative path too
  var newUrl = new URL(url, window.location.origin);

  // Add the params to the url
  Object.keys(params).forEach(function (key) {
    newUrl.searchParams.set(key, params[key]);
  });

  // Navigate to the new url
  window.location.href = newUrl;
}


module.exports = Utilities;
