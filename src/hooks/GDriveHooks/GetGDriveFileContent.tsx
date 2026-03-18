import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";

export default function useGetGDriveFileContent(
  fileId: string,
  accessToken: string,
): Blob | null {
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  useEffect(() => {
    let flag = true;
    if (!flag) return;
    if (!fileId || !accessToken) return;
    GDriveService.GetGDriveFileContent(fileId, accessToken).then((res) => {
      if (res) setFileContent(res);
    });
    return () => {
      flag = false;
    };
  }, [fileId, accessToken]);
  return fileContent;
}
