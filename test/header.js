import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BSAHeader } from '../src/header.js';

// The archive is a copyrighted game asset, so it is not committed. Tests that
// need it are skipped when it is not present locally (e.g. in CI).
const archiveUrl = new URL('DLCVileLair.bsa', import.meta.url);
const skip = fs.existsSync(archiveUrl)
  ? false
  : 'DLCVileLair.bsa is not present in the test folder';

const archive = skip ? null : fs.readFileSync(archiveUrl);

const readHeader = () => new BSAHeader(archive);

describe('BSAHeader', () => {
  it('does not throw when reading the archive header', { skip }, () => {
    assert.doesNotThrow(readHeader);
  });

  it('reads archive version', { skip }, () => {
    const header = readHeader();

    assert.equal(header.version, 103);
  });

  it('check file header size', { skip }, () => {
    const header = readHeader();

    assert.equal(header.headerSize, 36);
  });

  it('reads file totals', { skip }, () => {
    const header = readHeader();

    assert.equal(header.totalFiles, 57);
  });

  it('reads archive flags', { skip }, () => {
    const { flags } = readHeader();

    assert.equal(flags.toNumber(), 0x7_07);
    assert.equal(flags.hasFolderNames, true);
    assert.equal(flags.hasFileNames, true);
    assert.equal(flags.isCompressed, true);
    assert.equal(flags.omitFileNames, false);
    assert.equal(flags.isBigEndian, false);
  });

  it('reads content type flags', { skip }, () => {
    const { contentType } = readHeader();

    assert.equal(contentType.meshes, true);
    assert.equal(contentType.textures, true);
    assert.equal(contentType.menus, false);
    assert.equal(contentType.sounds, true);
    assert.equal(contentType.voices, true);
    assert.equal(contentType.shaders, false);
    assert.equal(contentType.trees, false);
    assert.equal(contentType.fonts, false);
    assert.equal(contentType.miscellaneous, false);
  });
});

describe('BSAHeader defaults', () => {
  it('creates an empty v103 header', () => {
    const header = new BSAHeader();

    assert.equal(header.version, 103);
    assert.equal(header.headerSize, 36);
    assert.equal(header.totalFolders, 0);
    assert.equal(header.totalFiles, 0);
    assert.equal(header.contentType.meshes, false);
  });
});

describe('BSAHeader validation', () => {
  const createHeader = ({
    magic = 4_281_154,
    version = 103,
    headerSize = 36,
    flags = 0,
  } = {}) => {
    const data = Buffer.alloc(36);

    data.writeUInt32LE(magic, 0);
    data.writeUInt32LE(version, 4);
    data.writeUInt32LE(headerSize, 8);
    data.writeUInt32LE(flags, 12);

    return data;
  };

  it('reads headerSize from the data', () => {
    const { headerSize } = new BSAHeader(createHeader({ headerSize: 64 }));

    assert.equal(headerSize, 64);
  });

  it('reads archive flags from the data', () => {
    const { flags } = new BSAHeader(createHeader({ flags: 0x6 }));

    assert.equal(flags.hasFolderNames, false);
    assert.equal(flags.hasFileNames, true);
    assert.equal(flags.isCompressed, true);
    assert.equal(flags.toNumber(), 0x6);
  });

  it('rejects data shorter than the header', () => {
    assert.throws(() => new BSAHeader(Buffer.alloc(35)), RangeError);
  });

  it('rejects a foreign file signature', () => {
    assert.throws(
      () => new BSAHeader(createHeader({ magic: 0 })),
      /Invalid file/,
    );
  });

  it('rejects an unsupported version', () => {
    assert.throws(
      () => new BSAHeader(createHeader({ version: 104 })),
      /Invalid file version/,
    );
  });
});
