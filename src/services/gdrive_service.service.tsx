import { progress } from "framer-motion";
import type { GDriveFileList } from "../models/gdrive_file_list";

export class GDriveService {
  /**
   *
   */
  constructor() {}
  static async GetGDriveFiles({
    accessToken,
    folderId,
  }: {
    accessToken: string;
    folderId: string;
  }): Promise<GDriveFileList | undefined> {
    const res = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?pageSize=10&q='${folderId}' in parents&mimeType="${import.meta.env.VITE_EPUB_FILE}"`,
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
      console.error("Failed to fetch file content:", res.statusText);
    }
    return null;
  }

  static async CreateDirectory(
    accessToken: string,
    name: string,
    parentId?: string,
  ): Promise<string | undefined> {
    // check the folder already exists
    const existingFolderRes = await fetch(
      `${import.meta.env.VITE_GDRIVE_FILE_LIST_ENDPOINT}?q=${parentId ? `'${parentId}' in parents and ` : ""}"me" in owners and name="${name}" and mimeType="${import.meta.env.VITE_FOLDER_MIME_TYPE}" and trashed = false`,
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
      createTime: new Date().toISOString(),
      lastRead: null,
      progress: 0,
    };
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
}
