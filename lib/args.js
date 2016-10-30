const argparse = require('argparse')

const parser = new argparse.ArgumentParser({
  version: require('../package.json').version
})

const commands = parser.addSubparsers({
  title: 'Commands',
  dest: "command",
  help: 'sub-command help'
})

const list = commands.addParser('list', {
  aliases: ['l'],
  help: 'print list of files in archive'
})

list.addArgument(['-f', '--file'], {
  required: true,
  help: 'path to .bsa archive'
})

const extract = commands.addParser('extract', {
  aliases: ['e'],
  help: 'extract files from archive'
})

extract.addArgument(['-o', '--out'], {
  help: 'path to folder',
  defaultValue: '.'
})

extract.addArgument(['-f', '--file'], {
  required: true,
  help: 'path to .bsa archive'
})

module.exports = parser.parseArgs()
