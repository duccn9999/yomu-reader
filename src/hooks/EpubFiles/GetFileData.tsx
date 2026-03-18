import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import type { UnzipData } from "../../models/UnzipData";
import { Unzip } from "../../services/epub_service.service";

export default function useGetFileData(
  fileId: string,
  accessToken: string,
): UnzipData | null {
  const [data, setData] = useState<UnzipData | null>(null);

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
      if (!cancelled) {
        setData(unzipData);
      }
    }
    fetch();
    return () => {
      cancelled = true;
    };
  }, [fileId, accessToken]);
  return data;
}
