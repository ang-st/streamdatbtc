let program = require('commander')
let modules = require('./modules')

program
  .version('0.0.1')
  .option('-o, --offset', 'start blocks')
  .option('-i, --length', 'total blocks')

Object.keys(modules).forEach(modName => {
  let com = program.command(modName + ' <cmd> [subcmd...]')

  com.action((cmd, subcmd, opts) => {
    let module = new modules[modName]()
    let mlist = Object.keys(Object.getPrototypeOf(module))
    if (mlist.indexOf(cmd) > -1) {
      let method = module[cmd]
      method = method.bind(module)
      method(subcmd, opts)
    } else {
      console.log('[-] erreur invalid command ', modName, 'available commands : ', mlist)
    }
  })
})
program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}
