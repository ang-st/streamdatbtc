var fs = require('fs')
var bitcoin = require('bitcore-lib')
var BlockStream = require('blkdat-stream')
// var MongoClient = require('mongodb').MongoClient
var StreamQueue = require('streamqueue')
var ElapsedTime = require('elapsed-time')
var bluebird = require('bluebird')
var redis = require('redis')
bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

store = redis.createClient()

/*
glob('../.bitcoin/blocks/blk0010{0..3}.dat', {}, (e, f) => {
  console.log(f)
  threadInsert(f)
})
*/

let addressSpace = {}

let mapblock = function (block, cb) {
  block.transactions.map(tx => {
    tx.inputs.map(vin => {
      try {
        let addr = bitcoin.Script.fromString(vin.script).toAddress().toString()
        if (typeof (addressSpace[addr]) !== 'undefined') {
          addressSpace[addr]++
          store.hset(addr)
        } else {
          addressSpace[addr] = 1
        }

        // input.address =
      } catch (err) {
        console.log(err.toString())
      }
      return null// JSON.parse(JSON.stringify(input))
    })
/*
    var vouts = tx.outputs.map(vout => {
      var output = vout // bitcoin.Transaction.Output.fromObject(vout)a
      try {
        output.address = bitcoin.Script.fromString(vout.script).toAddress().toString()
      } catch (err) {
            //  console.log(err)
        output.address = null
      }
      output.txid = tx.hash
      output.blockhash = block.header.hash
            // return output.toJSON)
      // return JSON.parse(JSON.stringify(output))
      return null
    })
*/
    return tx

          // console.log('here')
  })

  // dbTxs.insertMany(txz)
  cb()
}

let threadInsert = function (filesList) {
  var queue = new StreamQueue({pauseFlowingStream: false, objectMode: true, resumeFlowingStream: false})

  filesList.forEach(f => queue.queue(fs.createReadStream(f)))
  // queue.done()

  var blockcount = 0 // atomic inc
  var et = ElapsedTime.new().start()
  var pipe = queue.done().pipe(new BlockStream())

  pipe.on('data', function (blockBuffer) {
    pipe.pause()
    blockcount++
    var B = bitcoin.Block.fromBuffer(blockBuffer).toJSON()
    if (blockcount % 10000 === 0) {
      // console.log(blockcount, et.getValue())
      console.log('found ', Object.keys(addressSpace).length, 'addresses', blockcount, 'time', et.getValue())
      et = ElapsedTime.new().start()
    }
    mapblock(B, function (e) {
      pipe.resume()
    })
  })

  pipe.on('end', function (e) {
    console.log('found ', Object.keys(addressSpace).length, 'addresses')
    // db.close()
    process.exit()
  })
}

module.exports = threadInsert
