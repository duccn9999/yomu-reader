import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import type { GDriveFile } from "../../models/gdrive_file";
import type { EpubFile } from "../../models/epub_file";
import { Unzip } from "../../services/epub_service.service";
import { XMLParser } from "fast-xml-parser";
import { MemoBooks } from "../../db/memory_db/memory_db";
export function useGetGDriveFiles(accessToken: string): void {
  const [files, setFiles] = useState<GDriveFile[] | undefined>(undefined);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
  });
  useEffect(() => {
    if (!accessToken) return;
    GDriveService.GetGDriveFiles({ accessToken }).then((res) => {
      if (res) setFiles(res.files);
    });
  }, [accessToken]);

  // get file data
  useEffect(() => {
    if (!files || !files.length) return;
    let cancelled = false;

    async function fetchFiles() {
      for (const file of files as GDriveFile[]) {
        const blob = await GDriveService.GetGDriveFileContent(
          "1naglNpRJE_xCYyFMjHHFgVPMc2RLUfU6",
          accessToken,
        );
        if (!blob) continue;

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
          if (data) bookContent.set(idref, data.content as string);
        }

        const book = {
          title: opfData.package.metadata.title,
          cover: coverBlob,
          content: bookContent,
        };

        MemoBooks.push({
          id: file.id,
          file: book,
        });
      }
    }
    fetchFiles();

    return () => {
      cancelled = true; // cleanup
    };
  }, [accessToken, files]);
}
