let Block = require('../utils').Blockdat

function Core () {
  this.blocks = new Block()
}

Core.prototype.info = function (cmd, opts) {
  console.log(JSON.stringify(this.blocks.info(), null, 4))
}

Core.prototype.doIndex = function (cms, opts) {
  let blockFiles = this.blocks.openOneStreamPerFile(opts)
  blockFiles.forEach(b => {
    console.log(b.name)
  })
}

module.exports = Core
