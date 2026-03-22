import { useEffect, useState } from "react";
import { Unzip } from "../../services/epub_service.service";

type epubMap = Map<
  string,
  { content: string | Blob | null; isDirectory: boolean }
>;
export function useUzipEpubFile(fileContent: Blob): epubMap {
  const [filesData, setFileData] = useState<epubMap>(new Map());
  useEffect(() => {
    if (!fileContent) return;

    let cancelled = false;
    async function run() {
      const res = await Unzip(fileContent);
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
