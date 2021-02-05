const { CONFIG } = require('./config');
const { Sequelize } = require('sequelize');
const { defineWorker, defineTask } = require('./model');

let task, worker;

function setupRelationship(orm) {
  worker = defineWorker(orm);
  task = defineTask(orm);

  task.belongsTo(worker, {
    onDelete: 'cascade',
    foreignKey: 'assigneeId',
  });
}

async function init() {
  const orm = new Sequelize(
    CONFIG.DATABASE,
    CONFIG.USERNAME,
    CONFIG.PASSWORD,
    CONFIG.DB_CONFIG
  );
  await orm.authenticate();
  setupRelationship(orm);
}

async function writeData(data) {
  await worker.create(data);
}

async function removeData(data) {
  return worker.findOne({ where: { id: data } });
}

// async function updateTask(data) {
//   const instance = task.findOne({ where: { id: data.id } });
//   instance.job = data.job;
//   await instance.save();
// }
// ``;
// async function writeDataTask(data) {
//   await task.create(data);
// }

// async function removeDataTask(data) {
//   return task.findOne({ where: { id: data } });
// }

async function readData() {
  const { count, rows } = await worker.findAndCountAll();
  return { count, rows };
}

module.exports = {
  init,
  writeData,
  readData,
  removeData,
};
