let fs = require('fs')
let path = require('path')
let modules = {}

let interfaceNames = function () {
  let n = Object.keys(modules)
  let keys = []
  n.forEach(n => {
    if (n !== 'Sequelize' && n !== 'sequelize') {
      keys.push(n)
    }
  })
  return keys
}

modules._tools = {interfaceNames}

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js')
}).forEach(function (file) {
  var module = require(path.join(__dirname, file))
  modules[module.name] = module.methods
})

module.exports = modules
