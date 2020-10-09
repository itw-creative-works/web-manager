/*
https://gist.github.com/joyrexus/7307312

JQUERY vs vanilla
https://github.com/nefe/You-Dont-Need-jDom#dom-manipulation

queryselector polyfill
https://gist.github.com/chrisjlee/8960575
* https://github.com/mtsyganov/queryselector-polyfill/blob/master/index.js

*/


function Dom(elObj) {
  this.elements = elObj;
}

function _forEach(array, callback, scope) {
  for (var i = 0, l = array ? array.length : 0; i < l; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
};

Dom.prototype.addClass = function(name) {
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    element.classList.add(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.removeClass = function(name) {
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    element.classList.remove(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.css = function(ops) {
  var elsObj = Object.assign({}, this.elements);
  var keys = Object.keys(ops);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    for (var i = 0; i < keys.length; i++) {
      element.style[keys[i]] = ops[keys[i]];
    }
  }
  return new Dom(elsObj);
}

Dom.prototype.hide = function(options) {
  var elsObj = Object.assign({}, this.elements);
  options = options || {};
  options.type = options.type || 'display' /* display, visibility, both*/
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if (options.type === 'visibility') {
      element.style.visibility = 'hidden';
    } else if (options.type === 'display') {
      element.style.display = 'none';
      element.setAttribute('hidden', true);
      element.classList.add('hidden');
    } else {
      element.style.visibility = 'hidden';
      element.style.display = 'none';
      element.setAttribute('hidden', true);
      element.classList.add('hidden');

    }
  }
  return new Dom(elsObj);
}

Dom.prototype.show = function(options) {
  var elsObj = Object.assign({}, this.elements);
  options = options || {};
  options.type = options.type || 'display' /* display, visibility, both*/
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if (options.type === 'visibility') {
      element.style.visibility = 'visible';
    } else if (options.type === 'display') {
      element.style.display = 'block';
      // element.setAttribute('hidden', false);
      element.removeAttribute('hidden');
      element.classList.remove('hidden');
    } else {
      element.style.visibility = 'visible';
      element.style.display = 'block';
      // element.setAttribute('hidden', false);
      element.removeAttribute('hidden');
      element.classList.remove('hidden');
    }
  }
  return new Dom(elsObj);
}

Dom.prototype.getAttribute = function(name, options) {
  var elsObj = Object.assign({}, this.elements);
  options = options || {};
  var r;
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    r = element.getAttribute(name);
  }
  return r;
}

Dom.prototype.setAttribute = function(name, value, options) {
  var elsObj = Object.assign({}, this.elements);
  options = options || {};
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    element.setAttribute(name, value);
  }
  return new Dom(elsObj);
}

Dom.prototype.removeAttribute = function(name, options) {
  var elsObj = Object.assign({}, this.elements);
  options = options || {};
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    element.setAttribute(name, 'DELETE');
    element.removeAttribute(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.getValue = function(options) {
  options = options || {};
  options.returnType = options.returnType || 'array'; // array, object, single (only for checkbox)
  var r;
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if ((element.type === 'checkbox') ) {
      if (elsObj.list.length === 1) {
        r = element.checked;
        break;
      } else {
        if (options.returnType === 'array') {
          r = (r) ? r : [];
          if (element.checked) {
            r.push(element.value);
          }
        } else if (options.returnType === 'object') {
          r = (r) ? r : {};
          r[element.value] = element.checked;
        } else {
          r = element.checked
        }
      }
    } else if (element.type === 'radio') {
      if (element.checked) {
        r = element.value;
        break;
      }
    } else {
      r = element.type === 'number' ? parseFloat(element.value) : element.value;
      break;
    }
  }
  return r;
}

Dom.prototype.setValue = function(value, options) {
  options = options || {};
  options.returnType = options.returnType || 'single';
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        element.checked = !!value.includes(element.value);
      } else if (typeof value === 'object') {
        element.checked = !!value[element.value];
      } else {
        element.checked = !!value;
      }
    } else if (element.type === 'radio') {
      element.checked = !!value;
    } else {
      element.value = value;
    }
  }
  return new Dom(elsObj);
}

Dom.prototype.setInnerHTML = function(html, options) {
  options = options || {};
  var elsObj = Object.assign({}, this.elements);
  // console.log('SET ', this);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    element.innerHTML = html;
  }
  return new Dom(elsObj);
}

Dom.prototype.each = function(fn, options) {
  options = options || {};
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if (fn(element, i) === false) {
      break;
    };
  }
  return new Dom(elsObj);
}

Dom.prototype.on = function(evt, fn) {
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    if (document.addEventListener) { // W3C model
        element.addEventListener(evt, fn, false);
        // return true;
    } else if (document.attachEvent) { // Microsoft model
        // return element.attachEvent('on' + evt, fn);
        element.attachEvent('on' + evt, fn);
    }
  }
  return new Dom(elsObj);
};

Dom.prototype.get = function(index) {
  return (index || 0 <= this.elements.count) ? this.elements.list[index || 0] : null;
}

Dom.prototype.exists = function() {
  return (this.elements.exists);
}

Dom.loadScript = function(options, callback) {
  options = options || {};
  options.async = (typeof options.async === 'undefined') ? false : options.async;
  options.crossorigin = (typeof options.crossorigin === 'undefined') ? false : options.crossorigin;
  var s = document.createElement('script');
  s.src = options.src;
  s.async = options.async;
  if (options.crossorigin) {
    s.setAttribute('crossorigin','*');
  }
  s.onload = function() {
    callback();
  };
  s.onerror = function() {
    callback(new Error('Failed to load script ' + options.src));
  };
  document.head.appendChild(s);
}

Dom.select = function(selector, options) {
  options = options || {};

  var elems;
  var type = typeof selector;
  if (type === 'string') {
    elems = document.querySelectorAll(selector);
  } else if (type === 'object') {
    elems = (selector && selector.tagName) ? [selector] : selector;
  }
  var r = [];

  _forEach(elems, function (index, value) {
    r.push(value);
  });

  return new Dom({
    list: r,
    count: r.length,
    exists: (r.length > 0),
  });
}


Dom.prototype.parent = function(selector) {
  var elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    var element = elsObj.list[i];
    if (!validate(element)) { continue; }
    do {
      if (element.matches(selector)) {
        return element;
      } else {
        element = element.parentNode;
      }
    } while (element && element.parentNode)
  }
  return new Dom(elsObj);
}

module.exports = Dom;

// Helpers
function validate(element) {
  return (element && element.tagName);
}
