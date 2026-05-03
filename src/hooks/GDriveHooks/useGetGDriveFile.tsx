import { Db } from "../../db/yomu_reader_db";
import { Book } from "../../models/book";
import { BookContent } from "../../models/book_content";
import type { MetadataBody } from "../../models/metadata_body";
import { EpubService } from "../../services/epub_service.service";
import { GDriveService } from "../../services/gdrive_service.service";

export async function useGetGDriveFile(
  accessToken: string,
  parentId: string,
  db: IDBDatabase,
): Promise<Book> {
  const book = new Book();
  const bookContent = new BookContent();

  const files = await GDriveService.GetFilesInFolder(parentId, accessToken);

  for (const file of files) {
    let bookId = file.id;

    const blob = await GDriveService.GetGDriveFileContent(bookId, accessToken);

    if (!blob) continue;

    if (file.mimeType === "application/epub+zip") {
      const { title, cover, result, refs, imgSrcs } =
        await EpubService.ExtractEpub(blob);

      for (const [key, value] of Object.entries(result)) {
        if (typeof value === "string") {
          const filteredContent = EpubService.ReplaceImgWithDummyImg(
            value,
            imgSrcs,
          );
          if (filteredContent.length == 0) continue;
          bookContent.chapters[key] = filteredContent;
        } else bookContent.blobs[key] = value;
      }

      book.title = title;
      book.cover = cover;
      book.refs = refs;
      book.parents = file.parents;
      book.imgSrcs = Object.values(imgSrcs);
    }

    if (file.mimeType === "application/json") {
      const text = await blob.text();
      const jsonData: MetadataBody = JSON.parse(text);

      bookContent.metadata = {
        metadataId: file.id,
        metadataBody: jsonData,
      };
    }

    await Db.addBook(db, {
      id: bookId,
      chapters: bookContent.chapters,
      blobs: bookContent.blobs,
      metadata: bookContent.metadata,
    });
  }

  /* insert in db */
  return book;
}
