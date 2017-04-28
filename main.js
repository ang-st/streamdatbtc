let program = require('commander')
let modules = require('./modules')

program
  .version('0.0.1')
  .option('-o, --offset', 'start blocks')
  .option('-i, --length', 'total blocks')

Object.keys(modules).forEach(modName => {
  let com = program.command(modName + ' <cmd> [subcmd...]')

  com.action((cmd, subcmd, opts) => {
    if (Object.keys(modules[modName]).indexOf(cmd) > -1) {
      let method = modules[modName][cmd]
      method(subcmd, opts)
    } else {
      console.log('[-] erreur invalid command ', modName, 'available commands : ', Object.keys(modules[modName]))
    }
  })
})
program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
