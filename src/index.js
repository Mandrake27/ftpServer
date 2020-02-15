const http = require('http'),
  url = require('url'),
  fs = require('fs'),
  { promisify } = require('util');
  const readFilePromisify = promisify(fs.readFile);

const readFile = async(req, res, fileName) => {
    await readFilePromisify(fileName, { encoding: 'utf8' }, (err, data) => {
      if (err) throw err;
      res.end(data);
    });
  };

const server = () => {
  http.createServer(async (req, res) => {
    const routes = url.parse(req.url);
    switch (routes.pathname) {
      case "/":
        readFile(req, res, './pages/index.html');
        break;
      case "/news":
        readFile(req, res, './pages/news.html');
        break;
      case "/weather":
        readFile(req, res, './pages/weather.html');
        break;
      case "/secret-stuff":
        readFile(req, res, './pages/secret-stuff.html');
        break;
      case "/settings":
        readFile(req, res, './pages/settings.html');
        break;
      default:
        readFile(req, res, './pages/index.html');
        break;
    }
  }).listen(3000);
};

server();