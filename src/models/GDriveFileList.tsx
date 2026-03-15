import type { GDriveFile } from "./GDriveFile";

export class GDriveFileList {
  files: GDriveFile[];
  kind: string;
  nextPageToken?: string;
  incompleteSearch?: boolean;
  constructor(
    files: GDriveFile[],
    kind: string,
    nextPageToken?: string,
    incompleteSearch?: boolean,
  ) {
    this.files = files;
    this.kind = kind;
    this.nextPageToken = nextPageToken;
    this.incompleteSearch = incompleteSearch;
  }
}
