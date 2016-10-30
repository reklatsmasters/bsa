# bsa
[![travis](https://travis-ci.org/ReklatsMasters/bsa.svg)](https://travis-ci.org/ReklatsMasters/bsa)
[![npm](https://img.shields.io/npm/v/bsa.svg)](https://npmjs.org/package/bsa)
[![license](https://img.shields.io/npm/l/bsa.svg)](https://npmjs.org/package/bsa)
[![downloads](https://img.shields.io/npm/dm/bsa.svg)](https://npmjs.org/package/bsa)

Bethesda Softworks Archive compress/decompress

## Usage

### as cli

```
npm i -g bsa
bsa -h
```

### as lib

`npm i -S bsa`

```js
const bsa = require('bsa')
const fs = require('fs')

const file = fs.readFileSync('Skyrim - Interface.bsa')
console.log(bsa.list(file))

/*
output:

[ 'interface\\controls\\360\\keyboard_english.txt',
  'interface\\controls\\360\\gamepad.txt',
  'interface\\controls\\360\\controlmap.txt',
  'interface\\controls\\ps3\\keyboard_english.txt'
  // more other files...
]
*/
```

## API

#### `list(buf: Buffer): Array<string>`
Return the list of files with folders names in archive

#### `extract(buf: Buffer, where: string(default = '.')): Promise<>`
extract files

## Support
* node >= 4
* uncompressed bsa v0x68 (skyrim)

## License
MIT, 2016 (c) Dmitry Tsvettsikh
