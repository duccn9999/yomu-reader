import type { GDriveFile } from "./gdrive_file";

export class RootFolder {
  id: string;
  folders: Map<string, GDriveFile[]>;
  constructor(id: string) {
    this.id = id;
    this.folders = new Map();
  }
}
