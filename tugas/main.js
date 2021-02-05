const { init } = require('./database/orm');
const server = require('./route/server');

async function serve() {
  try {
    console.log('trying connecting to database ......');
    await init();
  } catch (err) {
    console.error('server in trouble');
    return;
  }
  console.log('service is running ....');
  server.run();
}

serve();
