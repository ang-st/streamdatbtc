const _ = require('lodash')
const glob = require('glob')
const fs = require('fs')
const numCPUs = require('os').cpus().length

var BlockStream = require('blkdat-stream')
var StreamQueue = require('streamqueue')
let config = require('../config')

let buildFileList = function (args) {
  return glob.sync(config.blockchainPath + '/blk' + args + '.dat', {})
}

let buildFileRange = function (start, stop) {
  return _.range(start, stop).map(x => {
    return config.blockchainPath + '/blk' + _.padStart(x, 5, '0') + '.dat'
  })
}

let openStream = function (files) {
  var queue = new StreamQueue({pauseFlowingStream: false, objectMode: true, resumeFlowingStream: false})

  files.forEach(f => queue.queue(fs.createReadStream(f)))
  // queue.done()

  return queue.done().pipe(new BlockStream())
}

let openOneStreamPerFile = function (files) {
  return files.forEach(f => {
    return { name: f, stream: fs.createReadStream(f), start: undefined, stop: undefined }
  })
}

let getInfos = function () {
  let files = buildFileList('*').length

  return {
    cpu: numCPUs,
    config: config,
    blockfile_count: files,
    estimated_size: _.round(((files * 128) / 1024), 2) + ' Gb'

  }
}

module.exports = { buildFileList, openStream, openOneStreamPerFile, buildFileRange, getInfos }
