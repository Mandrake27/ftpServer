const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFilePromisify = promisify(fs.readFile);
const existsPromisify = promisify(fs.exists);
const statPromisify = promisify(fs.stat);
const readDirPromisify = promisify(fs.readdir);

const appDir = path.dirname(__filename);

const setTemplate = (fileList, pathname) =>
  `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
      a {
        text-decoration: none;
        color: blue;
      }

      .directory-list {
        list-style: none;
      }

      .directory-item {
        margin-bottom: 10px;
      }
    </style>
</head>
<body>
<ul class="directory-list">
    ${fileList.map(
      (file) => `<li class="directory-item"><a href="${file.path}">${file.fileName}</a></li>`
    ).join('')}
  </ul>
</body>
</html>`;

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
      const files = await readDirPromisify(pathname);
      const curPath = pathname.split(appDir)[1];
      const rootPath = curPath === '/' ? curPath : curPath + '/';
      const dirs = files.map(file => {
        return ({ path: rootPath + file, fileName: file })
      });
      const renderedList = setTemplate(dirs);
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(renderedList);
      return;
    }
    try {
      const data = await readFilePromisify(pathname);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(data);
    } catch (err) {
      res.statusCode = 500;
      res.end(`Error getting the file: ${err}.`);
    }
  })
  .listen(3000, () => {
    console.log('Server is running on localhost:3000/');
  });
