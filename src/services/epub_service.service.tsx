import type { IUnzipStructure } from "../interfaces/IUnzipStructure";
import * as zip from "@zip.js/zip.js";
import { UnzipStructure } from "../models/UnzipStructure";
export async function Unzip(file: Blob): Promise<IUnzipStructure> {
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const entries = await zipReader.getEntries();
  let unzipStructure = new UnzipStructure([]);
  for (const entry of entries) {
    unzipStructure.structure.push({
      fileName: entry.filename,
      isDirectory: entry.directory,
    });

    if (!entry.directory) {
      const blob = await entry.getData(new zip.BlobWriter());
      unzipStructure.structure.push({
        fileName: entry.filename,
        isDirectory: entry.directory,
      });
    }
  }

  return unzipStructure;
}

export function MergeHtml() {}
