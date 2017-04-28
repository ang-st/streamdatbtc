const cluster = require('cluster')
const glob = require('glob')
const streamDat = require('./stream-reduce')
const _ = require('lodash')

/*
function messageHandler (msg) {
  if (msg.job) {
    console.log(process.pid, 'got', msg.job.length, ' jobs')
    streamDat(msg.job)
  } else {
    process.exit()
  }
}

if (cluster.isMaster) {
  let args = process.argv[2] || '*'
  // let files = glob.sync('../.bitcoin/blocks/blk' + args + '.dat', {})
  let files = glob.sync('../blockdat/blk' + args + '.dat', {})
  // console.log(args, files.length)
  const numCPUs = 3 // keep 4 core for mongo

  let chunkSize = Math.floor(files.length / numCPUs + 1)
  let jobs = _.chunk(files, chunkSize)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  let i = 0
  for (const id in cluster.workers) {
    cluster.workers[id].send({job: jobs[i++]})
  }
} else {
  process.on('message', messageHandler)
}
*/
let args = process.argv[2] || '*'
  // let files = glob.sync('../.bitcoin/blocks/blk' + args + '.dat', {})
let files = glob.sync('../blockdat/blk' + args + '.dat', {})
streamDat(files)
