/*
*/

function Debug(utilObj) {
  this.debug = utilObj;
}

Debug.promise = function(status, data, options) {
  options = options || {};
  options.wait = options.wait || {enabled: false};
  return new Promise((resolve, reject) => {
    if (status == 'resolve') {
      if (options.wait.enabled) {
        Debug.wait(options.wait.msec, options.wait.range)
        .then(function () {
          // console.log('*** WAIT');
          resolve(data);
          console.log('[DEBUG] Debug.promise(resolve).');
        });
      } else {
        resolve(data);
        console.log('[DEBUG] Debug.promise(resolve).');
      }
    } else {
      if (options.wait.enabled) {
        Debug.wait(options.wait.msec, options.wait.range)
        .then(function () {
          // console.log('*** WAIT');
          reject(data);
          console.log('[DEBUG] Debug.promise(reject).');
        });
      } else {
        reject(data);
        console.log('[DEBUG] Debug.promise(reject).');
      }
    }
  })
}

Debug.wait = function(msec, range) {
  msec = msec || 0;
  range = range || 0;

  var min = 0;
  var randomNumPlus = (Math.random() * (range - min) + min);
  var randomNumMinus = (Math.random() * (range - min) + min);

  msec = msec + randomNumPlus - randomNumMinus;
  msec = (msec <= 0) ? 50 : msec;
  console.log('[DEBUG] waiting...', msec);
  return new Promise(resolve => setTimeout(resolve, msec));
}

module.exports = Debug;
