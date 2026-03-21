import * as zip from "@zip.js/zip.js";
export async function Unzip(
  file: Blob,
): Promise<
  Map<string, { content: string | Blob | null; isDirectory: boolean }>
> {
  const zipReader = new zip.ZipReader(new zip.BlobReader(file));
  const entries = (await zipReader.getEntries()) as unknown as zip.FileEntry[];
  let unzipStructure = new Map<
    string,
    { content: string | Blob | null; isDirectory: boolean }
  >();
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
    unzipStructure.set(entry.filename, {
      content,
      isDirectory: entry.directory,
    });
  }
  await zipReader.close();
  return unzipStructure;
}
export function MergeHtml() {}
