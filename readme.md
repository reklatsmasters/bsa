# bsa
[![travis](https://travis-ci.org/ReklatsMasters/bsa.svg)](https://travis-ci.org/ReklatsMasters/bsa)
[![npm](https://img.shields.io/npm/v/bsa.svg)](https://npmjs.org/package/bsa)
[![license](https://img.shields.io/npm/l/bsa.svg)](https://npmjs.org/package/bsa)
[![downloads](https://img.shields.io/npm/dm/bsa.svg)](https://npmjs.org/package/bsa)

Bethesda Softworks Archive extractor. Currently supports v103 only.

## Usage

```js
import * as bsa from 'bsa';

const file = fs.readFileSync('../Oblivion/Data/DLCShiveringIsles - Voices.bsa');
console.log(bsa.ls(file));

/*
output:

[ 'sound\\voice\\oblivion.esm\\imperial\\f\\senqdmania_goodbye_00040bb3_1.mp3',
  'sound\\voice\\oblivion.esm\\imperial\\f\\senqddementia_greeting_00068bc0_1.mp3',
  'sound\\voice\\oblivion.esm\\imperial\\f\\senqddementia_greeting_00068bca_1.mp3',
  'sound\\voice\\oblivion.esm\\imperial\\f\\se38_se38talkitemc_00082436_1.lip',
  // more other files...
]
*/
```

## API

#### `list(buf: Buffer): Array<string>`
#### `ls(buf: Buffer): Array<string>`
Return the list of files with folder names in archive

#### `extractFile(buf: Buffer, index: Number): Buffer`
Extract file based on index in file list.

#### `extract* (buf: Buffer)`
Iterator / generator to extract all files.

```js
for (const file of bsa.extract(bsafile)) {
  // do stuff...
}
```

## License
MIT, 2016 - 2025 (c) Dmitry Tsvettsikh
