
xhr({
type: 'POST',
//   url: 'https://testt2.free.beeceptor.com',
url: 'https://api.slapdform.com/',
// contentType: "application/json", // application/x-www-form-urlencoded | application/json
// accept: "application/json", // application/json, text/javascript, */*; q=0.01
// responseType: "json",
data: {
  name: "Jon Snow",
  // "slap_debug": true,
},
})
.success(function (data, raw) {
console.log('SUCCESS>');
console.log(data, raw);
// console.log(data, raw);
})
.error(function (data, raw) {
console.log('FAIL>');
console.log(data, raw);
});
