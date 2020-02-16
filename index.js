const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const fileExtension = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
};


http.createServer(function (req, res) {
  const parsedUrl = url.parse(req.url);

  const filterPathExit = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, filterPathExit);

  fs.exists(pathname, function (exist) {
    if(!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }

    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', fileExtension[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
}).listen(3000, () => {
  console.log('Server is running on localhost:3000/');
});