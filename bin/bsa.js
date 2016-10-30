#!/usr/bin/env node

const args = require('../lib/args')
const bsa = require('../')
const fs = require('fs')

const file = fs.readFileSync(args.file)

if (args.command == 'list' || args.command == 'l') {
  const list = bsa.list(file)

  for(const file of list) {
    process.stdout.write(file + '\n')
  }
} else if (args.command == 'extract' || args.command == 'e') {
  bsa.extract(file, args.out).catch(e => console.error(e))
}
