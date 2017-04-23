
var BlockStream = require('blkdat-stream')
var bitcoin = require('bitcore-lib')

var MongoClient = require('mongodb').MongoClient
var StreamQueue = require('streamqueue')

var fs = require('fs')

let doIndex = function (db, col, index) {
  let x = db.collection(col)
  return x.createIndex(index)
}

let createIndex = function (db) {
//  console.log("Create Index")
  return doIndex(db, 'blocks', {time: 1})
  .then(x => {
    return doIndex(db, 'transactions', { hash: 'text', block: 'text' })
  })
  .then(x => {
    return doIndex(db, 'vins', {address: 'text', hash: 'text', txid: 'text', blockhash: 'text'})
  })
  .then(x => {
    return doIndex(db, 'vouts', {address: 'text', hash: 'text', txid: 'text', blockhash: 'text'})
  })
  .then(x => {
    return db
  })
  .catch(e => {
    console.log('ERRR', e)
    return Promise.reject(e)
  })
}

let mapblock = function (block, db, cb) {
  var dbTxs = db.collection('transactions')
  var txz = block.transactions.map(tx => {
    tx.block = block.header.hash
    var Vout = db.collection('vouts')
    var Vin = db.collection('vins')

    var vins = tx.inputs.map(vin => {
      var input = vin
      try {
        input.address = bitcoin.Script.fromString(vin.script).toAddress().toString()
      } catch (err) {
             // console.log(err)
        input.address = null
      }
      input.txid = tx.hash
      input.blockhash = block.header.hash
      return JSON.parse(JSON.stringify(input))
    })

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
      return JSON.parse(JSON.stringify(output))
    })

    Vout.insertMany(vouts, (e, res) => {
      Vin.insertMany(vins, (e, res) => {
        return tx
      })
    })
    return tx

          // console.log('here')
  })

  dbTxs.insertMany(txz)
  cb()
}

var url = 'mongodb://localhost:27017/blockexplorer'

let processDat = function (db, stream) {
  console.log('process', process.pid, 'starting job')
  var pipe = stream.done().pipe(new BlockStream())
  pipe.on('data', function (blockBuffer) {
    pipe.pause()
    var B = bitcoin.Block.fromBuffer(blockBuffer).toJSON()
    var blocks = db.collection('blocks')
    blocks.insert(B.header)
        .then((e, x) => {
          mapblock(B, db, function (e) {
            pipe.resume()
          })
        })
        .catch((e) => {
          console.log(e)
          console.log(B.toJSON())
          pipe.resume()
        })
  })
  pipe.on('end', function (e) {
    console.log('done')
    db.close()
    process.exit()
  })

  pipe.on('error', e => {
    console.log('Pipe error', e)
  })
}
let threadInsert = function (filesList) {
  var queue = new StreamQueue({pauseFlowingStream: false, objectMode: true, resumeFlowingStream: false})

  filesList.forEach(f => queue.queue(fs.createReadStream(f)))
  // queue.done()
  // console.log(queue)
  MongoClient.connect(url, function (err, db) {
    if (err) return
    createIndex(db)
    .then(x => {
      return processDat(x, queue)
    })
    .catch(e => {
      console.log(e)
      db.close()
    })
  })
}

/*
glob('../.bitcoin/blocks/blk0010{0..3}.dat',{}, (e,f)=>{

  console.log(f)
  threadInsert(f)

})
*/

module.exports = threadInsert
