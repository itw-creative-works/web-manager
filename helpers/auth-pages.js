/*
*/
var dom;

function AuthPages() {
  var self = this;
  dom = window.Manager.dom();
  var pageQueryString = window.Manager.properties.page.queryString;

  dom.select('a[href*=signin], a[href*=signup], a[href*=forgot]').each(function (el) {
    var href = el.getAttribute('href');
    try {
      var newURL = new URL(href);
      pageQueryString.forEach(function(value, key) {
        newURL.searchParams.set(key, value)
      })
      el.setAttribute('href', newURL.toString())
    } catch (e) {
      console.warn('Failed to set auth URL', e);
    }
  })
}

module.exports = AuthPages;
