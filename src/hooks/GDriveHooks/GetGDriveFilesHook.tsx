import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import type { GDriveFile } from "../../models/GDriveFile";

export function useGetGDriveFiles(
  accessToken: string,
): GDriveFile[] | undefined {
  const [files, setFiles] = useState<GDriveFile[] | undefined>(undefined);
  useEffect(() => {
    if (!accessToken) return;
    GDriveService.GetGDriveFiles({ accessToken }).then((res) => {
      if (res) setFiles(res.files);
    });
  }, [accessToken]);
  return files;
}
