const _ = require('lodash')
const glob = require('glob')
const fs = require('fs')
// const numCPUs = require('os').cpus().length
const BlockStream = require('blkdat-stream')
const StreamQueue = require('streamqueue')
const config = require('../config')

let Blockdat = function () {
  this.config = config
}

Blockdat.prototype.buildFileList = function (args) {
  return glob.sync(this.config.blockchainPath + '/blk' + args + '.dat', {})
}

Blockdat.prototype.buildFileRange = function (start, stop) {
  return _.range(start, stop).map(x => {
    return this.config.blockchainPath + '/blk' + _.padStart(x, 5, '0') + '.dat'
  })
}

Blockdat.prototype.openStream = function (files) {
  var queue = new StreamQueue({pauseFlowingStream: false, objectMode: true, resumeFlowingStream: false})

  files.forEach(f => queue.queue(fs.createReadStream(f)))
  // queue.done()

  return queue.done().pipe(new BlockStream())
}

Blockdat.prototype.openOneStreamPerFile = function (files) {
  return files.forEach(f => {
    return { name: f, stream: fs.createReadStream(f), start: undefined, stop: undefined }
  })
}

Blockdat.prototype.info = function () {
  let files = this.buildFileList('*').length

  return {
    // cpu: numCPUs,
    config: config,
    blockfile_count: files,
    estimated_size: _.round(((files * 128) / 1024), 2) + ' Gb'

  }
}

module.exports = Blockdat
