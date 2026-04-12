import type { GDriveFile } from "./gdrive_file";
import type { Metadata } from "./metadata";

type folder = {
  id: string;
  content: GDriveFile;
  metadata: {
    id: string;
    data: Metadata;
  };
};
export class RootFolder {
  folders: folder[];
  constructor(folders: folder[]) {
    this.folders = folders;
  }
}
