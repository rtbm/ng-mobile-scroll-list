var static = require('node-static');
var file = new static.Server('./www');

const PORT = process.argv[2] || 8888;

require('http').createServer(function (request, response) {
  request.addListener('end', function () {
    file.serve(request, response);
  }).resume();
}).listen(PORT);

console.log('.,-^,.,-^,.,-^,.,-^,.,-^,.');
console.log(`|  Serving at ::${PORT}`);
console.log('.,-^,.,-^,.,-^,.,-^,.,-^,.');
