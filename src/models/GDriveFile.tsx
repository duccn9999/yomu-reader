export class GDriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  constructor(kind: string, id: string, name: string, mimeType: string) {
    this.kind = kind;
    this.id = id;
    this.name = name;
    this.mimeType = mimeType;
  }
}
