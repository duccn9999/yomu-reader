import type { IUnzipData } from "../interfaces/IUnzipData";
import * as zip from "@zip.js/zip.js";
import { UnzipData } from "../models/UnzipData";
export async function Unzip(file: Blob): Promise<IUnzipData> {
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const entries = (await zipReader.getEntries()) as unknown as zip.FileEntry[];
  let unzipStructure = new UnzipData([]);
  for (const entry of entries) {
    let content = null;
    if (
      entry.filename.endsWith(".jpg") ||
      entry.filename.endsWith(".jpeg") ||
      entry.filename.endsWith(".png")
    ) {
      content = await entry.getData(new zip.BlobWriter());
    } else if (
      entry.filename.endsWith(".opf") ||
      entry.filename.endsWith(".html")
    ) {
      content = await entry.getData(new zip.TextWriter());
    }
    unzipStructure.data.push({
      fileName: entry.filename,
      isDirectory: entry.directory,
      content: content,
    });
  }

  return unzipStructure;
}
export function MergeHtml() {}
