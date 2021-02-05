const fs = require('fs');
const path = require('path');
const { writeData, readData, removeData } = require('../../database/orm');
const Busboy = require('busboy');
const { saveFile } = require('../../database/storage');
const { Writeable } = require('stream');


function addTask(req, res) {
  const busboy = new Busboy({ headers: req.headers });

  let job = '';
  let worker = '';
  let status;

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('field', (fieldname, val) => {
    switch (fieldname) {
      case 'job':
        job = val;
        break;
      case 'worker':
        worker = val;
        break;
      case 'status':
        status = val === '' ? 'unfinished' : val;
        break;
      default:
        break;
    }
  });

  busboy.on('finish', async () => {
    const input = {
      job: job,
      worker: worker,
      status: status,
    };
    // await save(CONFIG.TASK, input);
    console.log(input);
    res.end();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

function uploadAttachment(req, res) {
  const busboy = new Busboy({ headers: req.headers });

  function abort() {
    req.unpipe(busboy);
    if (!req.aborted) {
      res.statusCode = 413;
      res.end();
    }
  }

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    switch (fieldname) {
      case 'photo':
        {
          const destname = randomFileName(mimetype);
          const store = fs.createWriteStream(
            path.resolve(__dirname, `../../file-storage/${destname}`)
          );
          file.on('error', abort);
          store.on('error', abort);
          file.pipe(store);
        }
        break;
      default: {
        const noop = new Writeable({
          write(chunk, encoding, callback) {
            setImmediate(callback);
          },
        });
        file.pipe(noop);
      }
    }
  });

  busboy.on('finish', async () => {
    res.end();
  });

  req.on('aborted', abort);
  busboy.on('error', abort);

  req.pipe(busboy);
}

module.exports = {
  addTask,
  uploadAttachment,
};
