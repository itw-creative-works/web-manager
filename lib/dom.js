/*
https://gist.github.com/joyrexus/7307312
*/
var Dom = (function() {

  /* start functions */
  function _forEach(array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
      callback.call(scope, i, array[i]); // passes back stuff we need
    }
  };

  function _removeClass(selector, name) {
    var elems = document.querySelectorAll(selector);
    var regex = new RegExp("\\b" + name + "\\b", "");
    if (!name) {return}
    _forEach(elems, function (index, value) {
  //     value.className = value.className.replace(regex, "")
      value.classList.remove(name)
    });
  }

  function _addClass(selector, name) {
    var elems = document.querySelectorAll(selector);
    var regex = new RegExp("\\b" + name + "\\b", "");
    if (!name) {return}
    _forEach(elems, function (index, value) {
      value.classList.add(name)
    });
  }

  function _hide(selector, options) {
    options = options || {};
    options.type = options.type || 'display' /* display, visibility, both*/
    var elems = document.querySelectorAll(selector); //divsToHide is an array

    _forEach(elems, function (index, value) {
      if (options.type == 'visibility') {
        value.style.visibility = 'hidden';
      } else if (options.type == 'display') {
        value.style.display = 'none';
      } else {
        value.style.visibility = 'hidden';
        value.style.display = 'none';
      }
    });
  }

  function _show(selector, options) {
    options = options || {};
    options.type = options.type || 'display' /* display, visibility, both*/
    var elems = document.querySelectorAll(selector); //divsToHide is an array
    _forEach(elems, function (index, value) {
      if (options.type == 'visibility') {
        value.style.visibility = 'visible';
      } else if (options.type == 'display') {
        value.style.display = 'block';
      } else {
        value.style.visibility = 'hidden';
        value.style.display = 'block';
      }
    });
  }

  function _getAttribute(selector, attr, options) {
    options = options || {};
    var r;
    var elems = document.querySelectorAll(selector); //divsToHide is an array
    _forEach(elems, function (index, value) {
        value.setAttribute(attr, attrValue);
        r = value.getAttribute(attr);
    });
    return r;
  }

  function _setAttribute(selector, attr, attrValue, options) {
    options = options || {};
    var elems = document.querySelectorAll(selector); //divsToHide is an array
    _forEach(elems, function (index, value) {
        value.setAttribute(attr, attrValue);
    });
  }

  function _removeAttribute(selector, attr, options) {
    options = options || {};
    var elems = document.querySelectorAll(selector); //divsToHide is an array
    _forEach(elems, function (index, value) {
        value.removeAttribute(attr);
    });
  }

  function _getInputValue(selector, options) {
    options = options || {};
    options.returnType = options.returnType || 'single';
    var elems = document.querySelectorAll(selector); //divsToHide is an array
    var r;

    _forEach(elems, function (index, value) {
      // console.log('type = '+value.type)
      if ((value.type == 'checkbox') ) {
        if (elems.length < 1) {
          r = value.checked;
        } else {
          if (options.returnType == 'array') {
            r = (r) ? r : [];
            r.push([value.value, value.checked])
          } else if (options.returnType == 'object') {
            r = (r) ? r : {};
            r[value.value] = value.checked;
          } else {
            r = value.checked
          }
        }
        return;
      } else if (value.type == 'radio') {
        if (options.returnType == 'array') {
          r = (r) ? r : [];
          r.push([value.value, value.checked])
        } else if (options.returnType == 'object') {
          r = (r) ? r : {};
          r[value.value] = value.checked;
        } else {
          if (value.checked) {
            r = value.value;
            return;
          }
        }

      } else {
        r = value.value;
        return value.value;
      }
    });
    return r;
  }

  function _setInputValue(selector, toValue, options) {
    options = options || {};
    options.returnType = options.returnType || 'single';
    var elems = document.querySelectorAll(selector); //divsToHide is an array

    _forEach(elems, function (index, value) {
      // console.log('type = '+value.type+', '+toValue)
      if (value.type == 'checkbox') {
        value.checked = !!toValue;
      } else if (value.type == 'radio') {
        value.checked = !!toValue;
      } else {
        value.value = toValue;
      }
    });
  }

  function _setInnerHTML(selector, html, options) {
    options = options || {};
    var elems = document.querySelectorAll(selector); //divsToHide is an array

    _forEach(elems, function (index, value) {
      value.innerHTML = html;
    });
  }
  /* end functions */

  return {
    forEach: _forEach,
    removeClass: _removeClass,
    addClass: _addClass,
    hide: _hide,
    show: _show,
    getAttribute: _getAttribute,
    setAttribute: _setAttribute,
    removeAttribute: _removeAttribute,
    getInputValue: _getInputValue,
    setInputValue: _setInputValue,
    setInnerHTML: _setInnerHTML,
  };


})();

module.exports = Dom;
