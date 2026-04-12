import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import { GDriveFile } from "../../models/gdrive_file";
import type { EpubFile } from "../../models/epub_file";
import { Unzip } from "../../services/epub_service.service";
import { XMLParser } from "fast-xml-parser";
import { cache, MemoBooks, type Book } from "../../db/memory_db/memory_db";
import type { RootFolder } from "../../models/root_folder";
export function useGetGDriveFiles(accessToken: string): void {
  const [files, setFiles] = useState<RootFolder | undefined>(undefined);
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
      if (res) setFiles(res);
    }

    init();
  }, [accessToken]);

  // get file data
  useEffect(() => {
    if (!files || !files.folders?.length) return;
    let cancelled = false;
    let configJsonId = "";

    async function fetchFiles() {
      for (const file of files?.folders || []) {
        const blob = await GDriveService.GetGDriveFileContent(
          file.content.id,
          accessToken,
        );
        if (!blob) continue;

        if (file.content.name === "config.json") {
          configJsonId = file.content.id;
        } else {
          const unzipData = await Unzip(blob);
          if (cancelled) break;

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

          const book = {
            title: opfData.package.metadata.title,
            cover: coverBlob,
            content: bookContent,
            notes: {
              noteId: configJsonId,
              data: file.metadata?.data.notes || [],
            },
          } as Book;

          MemoBooks.push({
            id: file.id,
            file: book,
          });
        }
      }
    }
    fetchFiles();

    return () => {
      cancelled = true; // cleanup
    };
  }, [accessToken, files]);
}
