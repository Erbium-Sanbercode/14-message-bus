/* eslint-disable no-unused-vars */
const nats = require('nats');
const  client= nats.connect();


client.on('connect', (data) => {
  casting(data)
})

client.on('close', (err) =>{
  if(err){
    console.log('can not cast messages')
  }
  console.log('client has stop casting')
})

async function subscriber (){
  let performanceSrv;
  performanceSrv = client.subscribe('performance.*', async (msg, reply, subject, sid ) => {    
    if(subject === 'subject.task'){      
      try {              
        const getServiceName = await subject.split('.')[1]
        await storeMessage(getServiceName, msg)
      }
      catch (err){
        console.log('failed to save task log')
      } 
    }
    else if(subject === 'subject.worker'){
      try {              
        const getServiceName = await subject.split('.')[1]
        await storeMessage(getServiceName, msg)
      }
      catch (err){
        console.log('failed to save task log')
      } 
    }
    else {      
        console.error('subject is unkown')      
    }
  })    
    
}


  async function taskStreamer(data){
      client.publish('performance.task', JSON.stringify(data) )
    }

  async function workerStreamer(data){
      client.publish('performance.worker', JSON.stringify(data) )
    }
function casting(){
  subscriber()
}

