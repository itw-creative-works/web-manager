/*
*/

var shadow;

function Utilities(utilObj) {
  this.utilities = utilObj;
}

/* https://gist.github.com/jeneg/9767afdcca45601ea44930ea03e0febf */
Utilities.get = function (obj, path, def) {
  var fullPath = (path || '')
    .replace(/\[/g, '.')
    .replace(/]/g, '')
    .split('.')
    .filter(Boolean);

  return fullPath.every(everyFunc) ? obj : def;

  function everyFunc(step) {
    // return !(step && (obj = obj[step]) === undefined);
    // console.log(' CHECK > ', !(step && (obj = obj[step]) === undefined));
    // console.log('step', step, 'obj', obj, 'objstep', obj[step]);
    // return !(step && (obj = obj[step]) === undefined);
    return !(step && (obj = obj[step]) === undefined);
  }
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
  shadow.appendChild(document.createTextNode(str));

  return shadow.innerHTML.replace(/["']/g, function(m) {
    switch (m) {
      case '"':
        return '&quot;';
      default:
        return '&#039;';
    }
  });
}

module.exports = Utilities;
