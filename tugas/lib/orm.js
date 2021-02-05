const { Sequelize } = require('sequelize');
const { CONFIG } = require('./config');
const { defineTask } = require('../tasks/task.model');
const { defineWorker } = require('../worker/worker.model');

const ERROR_REGISTER_DATA_INVALID = 'data tidak lengkap';
const ERROR_WORKER_NOT_FOUND = 'data tidak ditemukan';

exports.orm;
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
  await orm.sync({ alter: true });
}

async function writeData(data) {
  await worker.create(data);
}

async function removeData(data) {
  const workDel = await worker.findByPk(data);
  if (!workDel) {
    throw ERROR_WORKER_NOT_FOUND;
  }
  await workDel.destroy();
  return workDel;
}

async function readData() {
  const { count, rows } = await worker.findAndCountAll();
  return { count, rows };
}
// async function updateTask(data) {
//   const instance = task.findOne({ where: { id: data.id } });
//   instance.job = data.job;
//   await instance.save();
// }
// ``;
async function writeDataTask(data) {
  console.log(data);
  await task.create(data);
}

async function doneDataTask(data){
  console.log(data);
  const taskDone = await task.findByPk(data);
  const taskDoneRapi = JSON.stringify(taskDone);
  console.log(taskDone);
  console.log({ taskDone });
  await task.update({ id:taskDone.id });
  // models.Address.update({
  //   city: city,
  //   zip_code: zip_code,
  //   street: street
  // }, {
  //   where: {
  //     id: id
  //   }
  // })
  //   .then(() => {
  //     view.messageSuccess(`Data with id ${id} success to updated`);
  //   })
  //   .catch(err => {
  //     view.messageErr(err.message);
  //   });
}
// async function removeDataTask(data) {
//   return task.findOne({ where: { id: data } });
// }


module.exports = {
  init,
  writeData,
  readData,
  removeData,
  writeDataTask,
  doneDataTask,
  ERROR_REGISTER_DATA_INVALID,
  ERROR_WORKER_NOT_FOUND,
};
