console.log('> Manager (top)');
var Manager = (function() {
  console.log('> Manager (function)');

  // https://www.npmjs.com/package/global
  // https://www.npmjs.com/package/get-window
  // https://www.npmjs.com/package/window


  /* start functions */
  function _init(initObj) {
    console.log('> Manager (init)');
    console.log('window', window);
    console.log('initObj',initObj);
  }
  /* end functions */

  return {
   init: _init
  };


})();

module.exports = Manager;
