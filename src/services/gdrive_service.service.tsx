import { GDriveFile } from "../models/GDriveFile";
import type { GDriveFileList } from "../models/GDriveFileList";

export class GDriveService {
  /**
   *
   */
  constructor() {}
  static async GetGDriveFiles({
    accessToken,
  }: {
    accessToken: string;
  }): Promise<GDriveFileList | undefined> {
    const res = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?pageSize=1&q="me" in owners&mimeType="${import.meta.env.VITE_EPUB_FILE}"`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch((err) => {
      console.error("Error fetching gdrive files: ", err);
      return undefined;
    });
    if (!res) {
      return undefined;
    }
    return res.json();
  }

  static async GetGDriveFileContent(
    fileId: string,
    accessToken: string,
  ): Promise<Blob | null> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      console.error("Failed to fetch file content:", res.statusText);
    }
    return null;
  }
}
