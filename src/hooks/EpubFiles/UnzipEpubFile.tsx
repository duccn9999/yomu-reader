import { useEffect, useState } from "react";
import type { UnzipData } from "../../models/UnzipData";
import { Unzip } from "../../services/epub_service.service";

export function useUzipEpubFile(fileContent: Blob | null): UnzipData | null {
  const [filesData, setFileData] = useState<UnzipData | null>(null);
  useEffect(() => {
    if (!fileContent) return;

    let cancelled = false;
    const blob = fileContent;
    async function run() {
      const res = await Unzip(blob);
      if (!cancelled) {
        setFileData(res);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [fileContent]);
  return filesData;
}
