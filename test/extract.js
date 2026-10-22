import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractFile } from '../src/main.js';

// The archive is a copyrighted game asset, so it is not committed. The tests
// are skipped when it is not present locally (e.g. in CI).
const archiveUrl = new URL('DLCVileLair.bsa', import.meta.url);
const skip = fs.existsSync(archiveUrl)
  ? false
  : 'DLCVileLair.bsa is not present in the test folder';

const readArchive = () => fs.readFileSync(archiveUrl);
const header = (data) => data.subarray(0, 4).toString('hex');

describe('should extract files', () => {
  it('extracts the first file (.lip)', { skip }, () => {
    // File: sound\voice\dlcvilelair.esp\breton\m\dlcdeepscorn_goodbye_00004b9f_1.lip
    const file = extractFile(readArchive(), 0);

    assert.equal(file.length, 2514);
    assert.equal(header(file), '01000000');
  });

  it('extracts the second file (.mp3)', { skip }, () => {
    // File: sound\voice\dlcvilelair.esp\breton\m\dlcdeepscorn_goodbye_00004b9f_1.mp3
    const file = extractFile(readArchive(), 1);

    assert.equal(file.length, 18_391);
    assert.equal(header(file), 'fffb52c4');
  });

  it('extracts the seventh file (.dds)', { skip }, () => {
    // File: textures\vilelair\icons\menus50\iconbloodsalts.dds
    const file = extractFile(readArchive(), 6);

    assert.equal(file.length, 824);
    assert.equal(header(file), '44445320');
  });
});
