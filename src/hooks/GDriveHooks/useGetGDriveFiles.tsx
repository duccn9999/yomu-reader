import { useEffect, useState } from "react";
import { GDriveService } from "../../services/gdrive_service.service";
import { cache } from "../../db/memory_db/memory_db";
import { EpubService } from "../../services/epub_service.service";
import { MetadataBody } from "../../models/metadata_body";
import { Book } from "../../models/book";
import { Db } from "../../db/yomu_reader_db";
import { BookContent } from "../../models/book_content";

export function useGetGDriveFiles(
  accessToken: string,
  db: IDBDatabase,
): [
  Map<string, Book>,
  React.Dispatch<React.SetStateAction<Map<string, Book>>>,
] {
  const [books, setBooks] = useState<Map<string, Book>>(new Map());

  useEffect(() => {
    let cancelled = false;

    async function init() {
      let localBooksCache = new Map<string, Book>();

      const folderId = await GDriveService.CreateDirectory(
        accessToken,
        `${import.meta.env.VITE_ROOT_FOLDER_NAME}`,
      );

      if (!folderId || cancelled) return;

      cache.root_folder_id = folderId;

      const rootFolder = await GDriveService.GetRootFolder({
        accessToken,
        folderId,
      });

      if (!rootFolder || !rootFolder.folders || cancelled) return;

      for (const files of rootFolder.folders.values()) {
        const book = new Book();
        const bookContent = new BookContent();
        let bookId = "";

        for (const file of files) {
          bookId = file.id;

          const blob = await GDriveService.GetGDriveFileContent(
            bookId,
            accessToken,
          );

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

          if (cancelled) return;
        }

        await Db.addBook(db, {
          id: bookId,
          chapters: bookContent.chapters,
          blobs: bookContent.blobs,
          metadata: bookContent.metadata,
        });

        localBooksCache.set(bookId, book);
      }

      if (!cancelled) {
        localBooksCache = new Map(
          [...localBooksCache.entries()].sort(([, a], [, b]) =>
            a.title.localeCompare(b.title),
          ),
        );
        setBooks(localBooksCache);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [accessToken, db]);

  return [books, setBooks];
}
