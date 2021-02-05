const path = require('path');
const mime = require('mime-types');
const { abort } = require('process');
const { Client } = require('minio');

/**
 * generate random file name
 * @param {string} mimetype mimetype
 * @returns {string} generated file name
 */
const client = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
});

function randomFileName(mimetype) {
  return (
    new Date().getTime() +
    '-' +
    Math.round(Math.random() * 1000) +
    '.' +
    mime.extension(mimetype)
  );
}

/**
 * save file to file system
 * @param {Readable} file readable file stream
 * @param {string} mimetype mime type
 * @returns {Promise<string>} generated filename
 */
function saveFile(file, destname) {

   client.putObject('photo', destname, file, (err, res) => {
    if (err) {
      console.log(err);
      abort();
    }
    console.log('sukses');
  });
}

module.exports = {
  randomFileName,
  saveFile,
};
