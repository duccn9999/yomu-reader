import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import type { EpubFile } from "../../models/epub_file";
import { Unzip } from "../../services/epub_service.service";
import { XMLParser } from "fast-xml-parser";
import { cache, MemoBooks, type Book } from "../../db/memory_db/memory_db";
import type { RootFolder } from "../../models/root_folder";
import type { Metadata } from "../../models/metadata";
export function useGetGDriveFiles(accessToken: string): void {
  const [root, setRoot] = useState<RootFolder | undefined>(undefined);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });

  const domParser = new DOMParser();
  useEffect(() => {
    async function init() {
      const folderId = await GDriveService.CreateDirectory(
        accessToken,
        `${import.meta.env.VITE_ROOT_FOLDER_NAME}`,
      );
      if (!folderId) return;
      cache.root_folder_id = folderId;
      const res = await GDriveService.GetRootFolder({ accessToken, folderId });
      if (res) setRoot(res);
    }

    init();
  }, [accessToken]);
  // get file data
  useEffect(() => {
    if (!root || !root.folders) return;

    let cancelled = false;
    async function fetchFiles() {
      for (const files of root!.folders.values()) {
        // if (cancelled) return;
        let book: Book = {} as Book;
        let bookId = "";
        for (const file of files) {
          // if (cancelled) return;
          bookId = file.id;
          const blob = await GDriveService.GetGDriveFileContent(
            bookId,
            accessToken,
          );

          // if (cancelled) return;
          if (!blob) continue;

          // epub
          if (file.mimeType === "application/epub+zip") {
            const unzipData = await Unzip(blob);
            // if (cancelled) return;

            const opfFile = unzipData.get("content.opf");
            const coverFile =
              unzipData.get("cover.jpg") || unzipData.get("cover.jpeg");

            const opfData = parser.parse(
              opfFile?.content as string,
            ) as EpubFile | null;

            if (!opfData) continue;

            const coverBlob = coverFile?.content as Blob | null;
            const spine = opfData.package.spine;
            const items = opfData.package.manifest.item;

            const manifestMap = new Map(
              items.map((item) => [item["@_id"], item["@_href"]]),
            );

            const bookContent = new Map<string, string>();

            for (const ref of spine.itemref) {
              const idref = ref["@_idref"];
              const manifestItem = manifestMap.get(idref);
              if (!manifestItem) continue;

              const data = unzipData.get(manifestItem);
              const htmlStr = data?.content as string;

              const html = domParser.parseFromString(htmlStr, "text/html");
              const body = html.body.innerHTML;

              if (data) bookContent.set(idref, body);
            }

            book.title = opfData.package.metadata.title;
            book.cover = coverBlob;
            book.content = bookContent;
          }

          // json
          else if (file.mimeType === "application/json") {
            const text = await blob.text();

            const jsonData: Metadata = JSON.parse(text);

            book.notes = {
              noteId: file.id,
              data: jsonData.notes,
            };
          }

          if (cancelled) return;
        }
        MemoBooks.push({
          id: bookId,
          file: book,
        });
      }
    }

    fetchFiles();

    return () => {
      cancelled = true;
    };
  }, [accessToken, root]);
}
