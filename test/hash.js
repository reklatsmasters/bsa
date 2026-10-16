import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import createHash, { createFolderHash } from '../src/hash.js';

describe('should calc file hash', () => {
  it('calc .nif file', () => {
    assert.equal(
      createHash('meshes\\vilelair\\humanstatue1.nif'),
      0xf1_ed_33_99_68_0c_e5_31n,
    );
  });

  it('calc .dds file', () => {
    assert.equal(
      createHash('textures\\vilelair\\ichorblood_n.dds'),
      0x04_d5_55_57_69_0c_df_een,
    );
  });

  it('calc .mp3 file', () => {
    assert.equal(
      createHash(
        'sound\\voice\\dlcvilelair.esp\\breton\\m\\dlcdeepscorn_goodbye_00004b9f_1.mp3',
      ),
      0x0a_4a_ab_12_64_1f_5f_31n,
    );
  });

  it('calc .lip file', () => {
    assert.equal(
      createHash(
        'sound\\voice\\dlcvilelair.esp\\breton\\m\\dlcdeepscorn_goodbye_00004b9f_1.lip',
      ),
      0x09_c5_9a_15_64_1f_5f_31n,
    );
  });
});

describe('should calc folder hash', () => {
  it('calc folder path', () => {
    assert.equal(
      createFolderHash('textures\\vilelair'),
      0x42_4b_04_51_74_11_69_72n,
    );
  });
});
