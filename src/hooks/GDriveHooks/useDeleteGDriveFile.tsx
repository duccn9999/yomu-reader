import { GDriveService } from "../../services/gdrive_service.service";
export default function useDeleteGDriveFile(accessToken: string) {
  async function deleteFile(fileId: string) {
    if (!fileId || !accessToken) return;

    try {
      await GDriveService.DeleteBook(fileId, accessToken);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return { deleteFile };
}
