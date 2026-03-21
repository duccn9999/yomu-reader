import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import { Unzip } from "../../services/epub_service.service";
import { XMLParser } from "fast-xml-parser";
import type { EpubFile } from "../../models/EpubFile";

export default function useGetFileData(
  fileId: string,
  accessToken: string,
): [EpubFile | null, Blob | null] {
  const [epubData, setEpubData] = useState<EpubFile | null>(null);
  const [cover, setCover] = useState<Blob | null>(null);
  useEffect(() => {
    if (!fileId || !accessToken) return;

    let cancelled = false;
    async function fetch() {
      const blob = await GDriveService.GetGDriveFileContent(
        fileId,
        accessToken,
      );

      if (!blob) return;

      const unzipData = await Unzip(blob);
      console.log(unzipData);
      if (!cancelled) {
        const opfFile = unzipData.get("content.opf");
        const coverFile =
          unzipData.get("cover.jpg") || unzipData.get("cover.jpeg");

        if (coverFile) {
          const coverBlob = (await coverFile.content) as Blob | null;
          setCover(coverBlob);
        }
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          removeNSPrefix: true,
        });
        let opfData = parser.parse(
          opfFile?.content as string,
        ) as EpubFile | null;
        if (!opfData) return;
        setEpubData(opfData);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [fileId, accessToken]);

  return [epubData, cover];
}
