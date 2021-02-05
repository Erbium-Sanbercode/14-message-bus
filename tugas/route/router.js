const url = require('url');
const {
  addWorker,
  workerList,
  disMember,
} = require('../lib/worker-services/worker-services');

async function router(req, res) {
  function respond(statusCode, message) {
    res.statusCode = statusCode || 200;
    res.write(message || '');
    res.end();
  }
  try {
    const uri = url.parse(req.url, true);
    switch (uri.pathname) {
      case '/register':
        if (req.method === 'POST') {
          return addWorker(req, res);
        } else {
          respond(404);
        }
        break;
      case '/list':
        if (req.method === 'GET') {
          return workerList(req, res);
        } else {
          respond(404);
        }
        break;
      case '/remove':
        if (req.method === 'DELETE') {
          return disMember(req, res);
        } else {
          respond(404);
        }
        break;
      default:
        respond(404);
    }
  } catch (err) {
    respond(500, 'unkown server error');
  }
}

exports.router = router;
