import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import type { EpubFile } from "../../models/epub_file";
import { Unzip } from "../../services/epub_service.service";
import { XMLParser } from "fast-xml-parser";
import { cache, type Book } from "../../db/memory_db/memory_db";
import type { Metadata } from "../../models/metadata";

// module level cache
const booksCache = new Map<string, Book>();
let isFetched = false;

export function useGetGDriveFiles(accessToken: string) {
  const [gdriveFiles, setGdriveFiles] = useState<Map<string, Book>>(
    new Map(booksCache),
  );

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });
  const domParser = new DOMParser();

  useEffect(() => {
    if (isFetched) return;
    isFetched = true;
    let cancelled = false;

    async function init() {
      const folderId = await GDriveService.CreateDirectory(
        accessToken,
        `${import.meta.env.VITE_ROOT_FOLDER_NAME}`,
      );
      if (!folderId || cancelled) return;
      cache.root_folder_id = folderId;

      const root = await GDriveService.GetRootFolder({ accessToken, folderId });
      if (!root || !root.folders || cancelled) return;

      for (const files of root.folders.values()) {
        let book: Book = {} as Book;
        let bookId = "";

        for (const file of files) {
          bookId = file.id;
          const blob = await GDriveService.GetGDriveFileContent(
            bookId,
            accessToken,
          );
          if (!blob) continue;

          if (file.mimeType === "application/epub+zip") {
            const unzipData = await Unzip(blob);
            const opfEntry = Array.from(unzipData.keys()).find((key) =>
              key.endsWith("content.opf"),
            );
            const opfFile = opfEntry ? unzipData.get(opfEntry) : undefined;
            const coverEntry = Array.from(unzipData.keys()).find((key) =>
              key.toLowerCase().includes("cover"),
            );
            const coverFile = coverEntry
              ? unzipData.get(coverEntry)
              : undefined;
            const opfData = parser.parse(
              opfFile?.content as string,
            ) as EpubFile | null;
            if (!opfData) continue;

            const items = opfData.package.manifest.item;
            const manifestMap = new Map(
              items.map((item) => [item["@_id"], item["@_href"]]),
            );
            const bookContent = new Map<string, string>();

            manifestMap.forEach((manifestItem, id) => {
              const data =
                unzipData.get(manifestItem) ??
                unzipData.get(
                  Array.from(unzipData.keys()).find((k) =>
                    k.endsWith(manifestItem),
                  ) ?? "",
                );

              if (!data) return;

              // handle images
              if (
                manifestItem.endsWith(".jpg") ||
                manifestItem.endsWith(".jpeg") ||
                manifestItem.endsWith(".png") ||
                manifestItem.endsWith(".gif") ||
                manifestItem.endsWith(".webp")
              ) {
                const blobUrl = URL.createObjectURL(data.content as Blob);
                // ← store as styled img tag instead of raw blob url
                bookContent.set(
                  id,
                  `<img src="${blobUrl}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`,
                );
                return;
              }

              // handle html/xhtml
              const htmlStr = data.content as string;
              const html = domParser.parseFromString(htmlStr, "text/html");

              // replace img srcs with blob urls
              html.querySelectorAll("img").forEach((img) => {
                const src = img.getAttribute("src");
                if (!src) return;
                const imgEntry = Array.from(unzipData.entries()).find(([key]) =>
                  key.endsWith(src.split("/").pop() ?? ""),
                );
                if (imgEntry) {
                  const blobUrl = URL.createObjectURL(
                    imgEntry[1].content as Blob,
                  );
                  img.setAttribute("src", blobUrl);
                  img.style.maxWidth = "100%";
                  img.style.height = "auto";
                  img.style.display = "block";
                  img.style.margin = "0 auto";
                }
              });

              const body = html.body.innerHTML;
              bookContent.set(id, body);
            });
            book.title = opfData.package.metadata.title;
            book.cover = coverFile?.content as Blob | null;
            book.content = bookContent;
            book.parents = file.parents;
          } else if (file.mimeType === "application/json") {
            const text = await blob.text();
            const jsonData: Metadata = JSON.parse(text);
            book.notes = { noteId: file.id, data: jsonData.notes };
          }

          if (cancelled) return;
        }

        booksCache.set(bookId, book);
        if (!cancelled) setGdriveFiles(new Map(booksCache)); // ← progressive update per book
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  return { gdriveFiles };
}
