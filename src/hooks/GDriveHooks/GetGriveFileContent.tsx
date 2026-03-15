import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";

export default function useGetGDriveFileContent(
  fileId: string,
  accessToken: string,
): Blob | null {
  const [fileContent, setFileContent] = useState<Blob | null>(null);
  useEffect(() => {
    if (!fileId || !accessToken) return;
    GDriveService.GetGDriveFileContent(fileId, accessToken).then((res) => {
      if (res) setFileContent(res);
    });
  }, [fileId, accessToken]);
  return fileContent;
}
