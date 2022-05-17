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

// function AuthPages() {
//   var self = this;
//   dom = window.Manager.dom();
//   var authRegex = /\/(signin|signup|forgot)/;
//   var pageQueryString = window.Manager.properties.page.queryString;
//   var pageAuthRedirect = pageQueryString.get('auth_redirect')
//
//   if (pageAuthRedirect) {
//     dom.select('a').each(function (el) {
//       var href = el.getAttribute('href');
//       if (href && href.match(authRegex)) {
//         try {
//           var newURL = new URL(href);
//           if (newURL.pathname.match(authRegex)) {
//             newURL.searchParams.set('auth_redirect', pageAuthRedirect)
//             el.setAttribute('href', newURL.toString())
//           }
//         } catch (e) {
//           // console.warn('Failed to set auth URL', e);
//         }
//       }
//     })
//   }
// }

module.exports = AuthPages;
