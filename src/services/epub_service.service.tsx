import type { IEpubFile } from "../interfaces/IEpubFile";
import type { EpubFile } from "../models/EpubFile";
import * as zip from "@zip.js/zip.js";
export async function Unzip(file: Blob): Promise<IEpubFile> {
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const entries = await zipReader.getEntries();
  entries.forEach((entry) => {
    console.log(entry.filename, entry.directory); // directory is true if it's a folder
  });
  return null as unknown as EpubFile;
}

export function MergeHtml() {}
