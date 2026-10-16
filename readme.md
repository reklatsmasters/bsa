# bsa
[![CI](https://github.com/ReklatsMasters/bsa/actions/workflows/ci.yml/badge.svg)](https://github.com/ReklatsMasters/bsa/actions/workflows/ci.yml)
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

#### `extractFile(buf: Buffer, index: Number[, options: Object]): Buffer`
Extract file based on index in file list.

  * `options`
    - `keepFileMetadata: false`

    When `true` emit `BSAFileMetadata` data object.

#### `extract* (buf: Buffer[, options: Object])`
Iterator / generator to extract all files.

```js
for (const file of bsa.extract(bsafile)) {
  // do stuff...
}
```

For `options` see above.

#### `class BSAFileMetadata`
* get `data: Buffer`

Get file data.

* get `fileName: string`

Get file name. If file name is missing, it returns file hash as a hex string.

* get `filePath: string or null`

Get full file path in archive exclude file name. Depending on archive options it might be `null`.

## License
MIT, 2016 - 2025 (c) Dmitry Tsvettsikh
