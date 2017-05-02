const fs = require('fs')

let path = require('path')
let modules = {}

let interfaceNames = function () {
  return Object.keys(modules)
}

modules._tools = {interfaceNames}

fs.readdirSync(__dirname).filter(function (file) {
  return (file.indexOf('.') !== 0) && (file !== 'index.js')
}).forEach(function (file) {
  var module = require(path.join(__dirname, file))
  modules[module.name] = module
})

module.exports = modules
