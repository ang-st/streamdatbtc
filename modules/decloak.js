const fs = require('fs')
const Graph = require('sigma/src/classes/sigma.classes.graph')
const Block = require('../utils').Blockdat
const bitcoin = require('bitcore-lib')
const crypto = require('crypto')
const ElapsedTime = require('elapsed-time')

function Decloak () {
  this.blocks = new Block()
  this.txGraph = new Graph()
  this.publicKeyGraph = new Graph()
  this.stream = null
  this.et = ElapsedTime.new()
  this.blockcount = 0
}

Decloak.prototype.LoadData = function () {
  let list = this.blocks.buildFileList('00847')
  this.stream = this.blocks.openStream(list)
}

Decloak.prototype.getElapsed = function () {
  let et = this.et.getValue()
  this.et = ElapsedTime.new().start()
  return et
}
Decloak.prototype.RunModel = function () {
  let vm = this
  vm.LoadData()
  if (!this.stream) { throw new Error('Data stream not ready') }
  this.et.start()
  vm.stream.on('data', block => {
    vm.stream.pause()
    vm.blockcount++

    if (vm.blockcount % 100 === 0) { console.log('1000 block : ', vm.getElapsed()) }
    var B = bitcoin.Block(block)
    vm.mapblock(B, x => {
      console.log('block', this.getElapsed())
      vm.stream.resume()
    })
  })
  vm.stream.on('end', x => {
    console.log('Block Parsed, duartion', vm.et.getValue())
    fs.writeFileSync('/tmp/boubou', JSON.stringify(vm.txGraph, null, 4), 'utf-8')
  })
}

Decloak.prototype.mapblock = function (block, cb) {
  let vm = this
  block.transactions.map(txBuff => {
    let tx = bitcoin.Transaction(txBuff)
    // console.log(tx.toJSON())
    let id = tx.hash
    let node = {
      id: id,
      degIn: tx.inputs.length,
      degOut: tx.outputs.length
    }

    // console.log(node)
    if (vm.txGraph.nodes(node.id)) {
      console.log('Orphaned detected ', node.id)
      vm.txGraph = vm.txGraph.dropNode(node.id)
    }
    vm.txGraph = vm.txGraph.addNode(node)

    tx.inputs.map(vin => {
      // console.log(vin)
      let prevHash = vin.prevTxId.toString('hex')
      // console.log(vm.txGraph.nodes(prevHash))
      if (prevHash !== '0000000000000000000000000000000000000000000000000000000000000000') {
        if (!vm.txGraph.nodes(prevHash)) {
          vm.txGraph = vm.txGraph.addNode({id: prevHash}) /// shoulb be use only when started with offset
        }
        let edgeId = crypto.createHash('sha256').update(prevHash + tx.hash + vin.script).digest('hex')
        let edge = { source: prevHash, target: tx.hash, id: edgeId }
        // console.log(edge)
        vm.txGraph = vm.txGraph.addEdge(edge)
      }
      // console.log(vin.toJSON())
    })
    return tx
  })

  cb()
}

module.exports = Decloak
