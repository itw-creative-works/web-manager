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
  for (var i = 0; i < array.length; i++) {
    callback.call(scope, i, array[i]); // passes back stuff we need
  }
};

Dom.prototype.addClass = function(name) {
  const elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    elsObj.list[i].classList.add(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.removeClass = function(name) {
  const elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    elsObj.list[i].classList.remove(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.hide = function(options) {
  const elsObj = Object.assign({}, this.elements);
  options = options || {};
  options.type = options.type || 'display' /* display, visibility, both*/
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    if (options.type == 'visibility') {
      elsObj.list[i].style.visibility = 'hidden';
    } else if (options.type == 'display') {
      elsObj.list[i].style.display = 'none';
      elsObj.list[i].setAttribute('hidden', true);
      elsObj.list[i].classList.add('hidden');
    } else {
      elsObj.list[i].style.visibility = 'hidden';
      elsObj.list[i].style.display = 'none';
      elsObj.list[i].setAttribute('hidden', true);
      elsObj.list[i].classList.add('hidden');

    }
  }
  return new Dom(elsObj);
}

Dom.prototype.show = function(options) {
  const elsObj = Object.assign({}, this.elements);
  options = options || {};
  options.type = options.type || 'display' /* display, visibility, both*/
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    if (options.type == 'visibility') {
      elsObj.list[i].style.visibility = 'visible';
    } else if (options.type == 'display') {
      elsObj.list[i].style.display = 'block';
      elsObj.list[i].setAttribute('hidden', false);
      elsObj.list[i].classList.remove('hidden');
    } else {
      elsObj.list[i].style.visibility = 'visible';
      elsObj.list[i].style.display = 'block';
      elsObj.list[i].setAttribute('hidden', false);
      elsObj.list[i].classList.remove('hidden');
    }
  }
  return new Dom(elsObj);
}

Dom.prototype.getAttribute = function(name, options) {
  const elsObj = Object.assign({}, this.elements);
  options = options || {};
  var r;
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    r = elsObj.list[i].getAttribute(name);
  }
  return r;
}

Dom.prototype.setAttribute = function(name, value, options) {
  const elsObj = Object.assign({}, this.elements);
  options = options || {};
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    elsObj.list[i].setAttribute(name, value);
  }
  return new Dom(elsObj);
}

Dom.prototype.removeAttribute = function(name, options) {
  const elsObj = Object.assign({}, this.elements);
  options = options || {};
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    elsObj.list[i].removeAttribute(name);
  }
  return new Dom(elsObj);
}

Dom.prototype.getValue = function(options) {
  options = options || {};
  options.returnType = options.returnType || 'single';
  var r;
  const elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    if ((elsObj.list[i].type == 'checkbox') ) {
      if (elems.length < 1) {
        r = elsObj.list[i].checked;
      } else {
        if (options.returnType == 'array') {
          r = (r) ? r : [];
          r.push([elsObj.list[i].value, elsObj.list[i].checked])
        } else if (options.returnType == 'object') {
          r = (r) ? r : {};
          r[elsObj.list[i].value] = elsObj.list[i].checked;
        } else {
          r = elsObj.list[i].checked
        }
      }
      break;
    } else if (elsObj.list[i].type == 'radio') {
      if (options.returnType == 'array') {
        r = (r) ? r : [];
        r.push([elsObj.list[i].value, elsObj.list[i].checked])
      } else if (options.returnType == 'object') {
        r = (r) ? r : {};
        r[elsObj.list[i].value] = elsObj.list[i].checked;
      } else {
        if (elsObj.list[i].checked) {
          r = elsObj.list[i].value;
          break;
        }
      }

    } else {
      r = elsObj.list[i].value;
      break;
    }
  }
  return r;
}

Dom.prototype.setValue = function(value, options) {
  options = options || {};
  options.returnType = options.returnType || 'single';
  const elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    if (value.type == 'checkbox') {
      elsObj.list[i].checked = !!value;
    } else if (elsObj.list[i].type == 'radio') {
      elsObj.list[i].checked = !!value;
    } else {
      elsObj.list[i].value = value;
    }
  }
  return new Dom(elsObj);
}

Dom.prototype.setInnerHTML = function(html, options) {
  options = options || {};
  const elsObj = Object.assign({}, this.elements);
  // console.log('SET ', this);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    elsObj.list[i].innerHTML = html;
  }
  return new Dom(elsObj);
}

Dom.prototype.each = function(fn, options) {
  options = options || {};
  const elsObj = Object.assign({}, this.elements);
  for (var i = 0; i < elsObj.count; i++) {
    if (!elsObj.list[i]) { continue; }
    fn(i, elsObj.list[i]);
  }
  return new Dom(elsObj);
}

Dom.prototype.get = function(index) {
  return (index <= this.elements.count) ? this.elements.list[index] : null;
}

Dom.prototype.exists = function() {
  return (this.elements.exists);
}

Dom.loadScript = function(options, callback) {
  options = options || {};
  options.async = (typeof options.async === 'undefined') ? false : options.async;
  options.crossorigin = (typeof options.crossorigin === 'undefined') ? false : options.crossorigin;
  let s = document.createElement('script');
  s.src = options.src;
  s.async = options.async;
  if (options.crossorigin) {
    s.setAttribute('crossorigin','*');
  }
  s.onload = function() {
    callback();
  };
  s.onerror = function() {
    callback(new Error('Failed to load script ' + src));
  };
  document.head.appendChild(s);
}

Dom.checkDOMContentLoaded = function(win, fn) {
  var done = false, top = true,

  doc = win.document,
  root = doc.documentElement,
  modern = doc.addEventListener,

  add = modern ? 'addEventListener' : 'attachEvent',
  rem = modern ? 'removeEventListener' : 'detachEvent',
  pre = modern ? '' : 'on',

  init = function(e) {
    if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
    (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
    if (!done && (done = true)) fn.call(win, e.type || e);
  },

  poll = function() {
    try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
    init('poll');
  };

  if (doc.readyState == 'complete') fn.call(win, 'lazy');
  else {
    if (!modern && root.doScroll) {
      try { top = !win.frameElement; } catch(e) { }
      if (top) poll();
    }
    doc[add](pre + 'DOMContentLoaded', init, false);
    doc[add](pre + 'readystatechange', init, false);
    win[add](pre + 'load', init, false);
  }

}


Dom.select = function(selector, options) {
  options = options || {};
  var elems = (typeof selector === 'string') ? document.querySelectorAll(selector) : [selector];
  var r = [];

  _forEach(elems, function (index, value) {
    r.push(value);
  });

  return new Dom({
    // elements: {
      list: r,
      count: r.length,
      exists: (r.length > 0),
    // },
  });
}

module.exports = Dom;
