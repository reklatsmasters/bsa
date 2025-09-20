export class FileRecord {
  fileHash = BigInt(0);
  fileName = null;
  fileSize = 0;
  isCompressed = false;
  offsetFileBlock = 0;
}

export class FolderRecord {
  folderName = null;
  folderHash = BigInt(0);
  totalFiles = 0;
  offsetFileNames = 0;

  /** @type {FileRecord[]} */
  files = [];
}
