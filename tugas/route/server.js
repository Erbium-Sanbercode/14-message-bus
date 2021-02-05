const { createServer } = require('http');
const { router } = require('./router');
const { stdout } = require('process');

let server;


function run() {
  server = createServer((req, res) => {
    router(req, res);
  });

  // run server
  const PORT = 1969;
  server.listen(PORT, () => {
    stdout.write(`🚀 server listening on port ${PORT}\n`);
  });
}

/**
 * stop server
 */
function stop() {
  if (server) {
    server.close();
  }
}

module.exports = { run, stop };
