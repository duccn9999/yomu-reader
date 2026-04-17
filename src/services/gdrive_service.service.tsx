import { MemoBooks } from "../db/memory_db/memory_db";
import type { GDriveFile } from "../models/gdrive_file";
import type { GDriveFileList } from "../models/gdrive_file_list";
import type { Metadata } from "../models/metadata";
import { RootFolder } from "../models/root_folder";
import { SelectedData } from "../models/selected_data";

export class GDriveService {
  /**
   *
   */
  constructor() {}
  static async GetRootFolder({
    accessToken,
    folderId,
  }: {
    accessToken: string;
    folderId: string;
  }): Promise<RootFolder | undefined> {
    let root = new RootFolder(folderId);
    // 1. get subfolders
    const query = `'${folderId}' in parents and mimeType = '${import.meta.env.VITE_FOLDER_MIME_TYPE}' and trashed = false`;

    const foldersFetch = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?q=${encodeURIComponent(query)}&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    ).catch((err) => {
      console.error("Error fetching folders: ", err);
      return undefined;
    });

    if (!foldersFetch) return undefined;

    const folders = await foldersFetch.json();
    if (!folders) return undefined;

    const subFolders: { id: string; name: string }[] = folders.files ?? [];
    // 2. get all epub+json from all subfolders in one query
    const parentsQuery = subFolders
      .map((f: { id: string }) => `'${f.id}' in parents`)
      .join(" or ");

    const filesQuery = `(${parentsQuery}) and (mimeType = '${import.meta.env.VITE_EPUB_FILE}' or mimeType = 'application/json') and trashed = false`;

    const filesFetch = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?q=${encodeURIComponent(filesQuery)}&fields=files(id,name,mimeType,size,createdTime,parents)`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    ).catch((err) => {
      console.error("Error fetching files: ", err);
      return undefined;
    });
    if (!filesFetch) return undefined;
    const files = await filesFetch.json();
    // 3. map files to their parent folder
    for (const file of files.files) {
      const parentId = file.parents[0];

      const gdriveFile: GDriveFile = {
        id: file.id,
        kind: file.kind,
        name: file.name,
        mimeType: file.mimeType,
        parents: file.parents,
      };

      if (!root.folders.has(parentId)) {
        root.folders.set(parentId, []);
      }
      root.folders.get(parentId)?.push(gdriveFile);
    }
    return root;
  }

  static async GetGDriveFileContent(
    fileId: string,
    accessToken: string,
  ): Promise<Blob | null> {
    const query = `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}/${fileId}?alt=media`;
    const res = await fetch(query, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (res.ok) {
      const blob = await res.blob();
      return blob;
    } else {
      console.error("Failed to fetch file content:", res);
    }
    return null;
  }

  static async CreateDirectory(
    accessToken: string,
    name: string,
    parentId?: string,
  ): Promise<string | undefined> {
    // check the folder already exists
    const query = `${parentId ? `'${parentId}' in parents and ` : "'me' in owners and "}name = '${name}' and mimeType = '${import.meta.env.VITE_FOLDER_MIME_TYPE}' and trashed = false`;

    const existingFolderRes = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?q=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ).catch((err) => {
      console.error("Error checking existing directory: ", err);
      return undefined;
    });
    if (!existingFolderRes) {
      return undefined;
    }
    const existingFolderData = await existingFolderRes.json();
    if (existingFolderData.files && existingFolderData.files.length > 0) {
      console.log(
        "Directory already exists with ID: ",
        existingFolderData.files[0].id,
      );
      return existingFolderData.files[0].id;
    }

    // create if not exists
    const res = await fetch(import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        mimeType: import.meta.env.VITE_FOLDER_MIME_TYPE,
        ...(parentId && { parents: [parentId] }),
      }),
    }).catch((err) => {
      console.error("Error creating directory: ", err);
      return undefined;
    });
    if (!res) {
      return undefined;
    }
    return res.json().then((data) => {
      return data.id;
    });
  }

  static async UploadBook(
    accessToken: string,
    file: File,
    parentId: string,
  ): Promise<string | undefined> {
    // create subfolder with the same name as the file
    const folderId = await this.CreateDirectory(
      accessToken,
      file.name,
      parentId,
    );
    if (!folderId) {
      console.error("Failed to create subfolder for book: ", file.name);
      return undefined;
    }
    // upload the file to the subfolder
    const fileId = await this.UploadFile(accessToken, file, folderId);
    if (!fileId) {
      console.error("Failed to upload file: ", file.name);
      return undefined;
    }

    // create and upload config.json to the subfolder
    const config = {
      fileName: file.name,
      lastRead: null,
      progress: 0,
      notes: [] as SelectedData[],
    } as Metadata;
    const configBlob = new Blob([JSON.stringify(config)], {
      type: "application/json",
    });
    const configFile = new File([configBlob], "config.json", {
      type: "application/json",
    });
    const configFileId = await this.UploadFile(
      accessToken,
      configFile,
      folderId,
    );
    if (!configFileId) {
      console.error("Failed to upload config file for book: ", file.name);
      return undefined;
    }
    return fileId;
  }

  static async UploadFile(
    accessToken: string,
    file: File,
    parentId: string,
  ): Promise<string | undefined> {
    const metadata = {
      name: file.name,
      parents: [parentId],
      notes: [] as SelectedData[],
    };
    const formData = new FormData();
    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" }),
    );
    formData.append("file", file);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    ).catch((err) => {
      console.error("Error uploading file: ", err);
      return undefined;
    });
    if (!res) {
      return undefined;
    }
    return res.json().then((data) => data.id);
  }

  static async DeleteFile(fileId: string, accessToken: string) {
    const query = `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}/${fileId}`;
    const res = await fetch(query, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      console.error("Error deleting file: ", res.statusText);
    }
  }

  static async SyncMetadata(
    fileId: string,
    accessToken: string,
    metadata: Metadata,
  ) {
    const query = `${import.meta.env.VITE_GDRIVE_FILE_UPDATE_ENDPOINT}/${fileId}?uploadType=media`;
    const res = await fetch(query, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });
    if (!res.ok) {
      console.error("Error syncing metadata: ", res.statusText);
    }
  }
}
