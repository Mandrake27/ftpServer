const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFilePromisify = promisify(fs.readFile);
const existsPromisify = promisify(fs.exists);
const statPromisify = promisify(fs.stat);

const fileExtension = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json'
};

http
  .createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);

    const filterPathExit = path
      .normalize(parsedUrl.pathname)
      .replace(/^(\.\.[\/\\])+/, '');
    let pathname = path.join(__dirname, filterPathExit);

    const exist = await existsPromisify(pathname);
    if (!exist) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }
    if ((await statPromisify(pathname)).isDirectory()) {
      pathname += 'index.html';
    }
    try {
      const data = await readFilePromisify(pathname);
      const ext = path.parse(pathname).ext;
      res.setHeader('Content-Type', fileExtension[ext] || 'text/plain');
      res.end(data);
    } catch (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    }
  })
  .listen(3000, () => {
    console.log('Server is running on localhost:3000/');
  });
