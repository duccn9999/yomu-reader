export class GDriveFile {
  kind: string;
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  constructor(
    kind: string,
    id: string,
    name: string,
    mimeType: string,
    parents?: string[],
  ) {
    this.kind = kind;
    this.id = id;
    this.name = name;
    this.mimeType = mimeType;
    this.parents = parents;
  }
}
