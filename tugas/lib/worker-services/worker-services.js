const Busboy = require('busboy');
const {
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
} = require('../../route/utils');
const { writeData, readData, removeData } = require('../../database/orm');
const { saveFile } = require('../../database/storage');
const { Writable } = require('stream');
const url = require('url');

function addWorker(req, res) {
  const busboy = new Busboy({ headers: req.headers });

  const data = {
    name: '',
    address: 0,
    phone: '',
    email: '',
    bio: '',
    photo: '',
  };

  let finished = false;

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        try {
          data.photo = await saveFile(file, mimetype);
        } catch (err) {
          abort();
        }
        if (finished) {
          try {
            await writeData(data);
            res.setHeader('content-type', 'application/json');
            res.write(JSON.stringify(data));
          } catch (err) {
            if (err === ERROR_REGISTER_DATA_INVALID) {
              res.statusCode = 401;
            } else {
              res.statusCode = 500;
            }
            res.write(err);
          }
          res.end();
        }
        break;
      default: {
        const noop = new Writable({
          write(chunk, encoding, callback) {
            setImmediate(callback);
          },
        });
        file.pipe(noop);
      }
    }
  });

  busboy.on('field', (fieldname, val) => {
    if (['name', 'address', 'email', 'phone', 'bio'].includes(fieldname)) {
      data[fieldname] = val;
    }
  });

  busboy.on('finish', async () => {
    finished = true;
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

async function workerList(req, res) {
  try {
    const workers = await readData();
    res.setHeader('content-type', 'application/json');
    res.write(JSON.stringify(workers));
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end();
    return;
  }
}

async function disMember(req, res) {
  const uri = url.parse(req.url, true);
  const id = uri.query['id'];
  if (!id) {
    res.statusCode = 401;
    res.write('parameter id tidak ditemukan');
    res.end();
    return;
  }
  try {
    const worker = await removeData(id);
    res.setHeader('content-type', 'application/json');
    res.statusCode = 200;
    res.write(JSON.stringify(worker));
    res.end();
  } catch (err) {
    if (err === ERROR_WORKER_NOT_FOUND) {
      res.statusCode = 404;
      res.write(err);
      res.end();
      return;
    }
    res.statusCode = 500;
    res.end();
    return;
  }
}

module.exports = { addWorker, workerList, disMember };
