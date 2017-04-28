let utils = require('../utils')

let getInfo = function (cmd, opts) {
  console.log(JSON.stringify(utils.getInfos(), null, 4))
}

let doIndex = function (cms, opts) {
  let blockFiles = utils.openOneStreamPerFile(opts)
  blockFiles.forEach(b => {
    console.log(b.name)
  })
}

module.exports = {
  name: 'core',

  methods: {
    info: getInfo,
    index: doIndex

  }

}
