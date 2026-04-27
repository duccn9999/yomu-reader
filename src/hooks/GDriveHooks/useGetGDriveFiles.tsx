import { useEffect, useState } from 'react'
import { GDriveService } from '../../services/gdrive_service.service'
import { cache } from '../../db/memory_db/memory_db'
import { EpubService } from '../../services/epub_service.service'
import { Metadata } from '../../models/metadata'
import { Book } from '../../models/book'
import { Db } from '../../db/yomu_reader_db'
import { BookContent } from '../../models/book_content'
import { GenerateDummyImage } from '../../utils/dummy_image'

export function useGetGDriveFiles(accessToken: string, db: IDBDatabase) {
  const [books, setBooks] = useState<Map<string, Book>>(new Map())

  useEffect(() => {
    let cancelled = false

    async function init() {
      const localBooksCache = new Map<string, Book>()

      const folderId = await GDriveService.CreateDirectory(
        accessToken,
        `${import.meta.env.VITE_ROOT_FOLDER_NAME}`,
      )

      if (!folderId || cancelled) return

      cache.root_folder_id = folderId

      const rootFolder = await GDriveService.GetRootFolder({
        accessToken,
        folderId,
      })

      if (!rootFolder || !rootFolder.folders || cancelled) return

      for (const files of rootFolder.folders.values()) {
        const book = new Book()
        const bookContent = new BookContent()
        let bookId = ''

        for (const file of files) {
          bookId = file.id

          const blob = await GDriveService.GetGDriveFileContent(
            bookId,
            accessToken,
          )

          if (!blob) continue

          if (file.mimeType === 'application/epub+zip') {
            const { title, cover, result, refs, imgSrcs } =
              await EpubService.ExtractEpub(bookId, blob)

            for (const [key, value] of Object.entries(result)) {
              if (typeof value === 'string') {
                const filteredContent = replaceImgWithDummyImg(value, imgSrcs)
                if (filteredContent.length == 0) continue
                bookContent.chapters[key] = filteredContent
              } else bookContent.blobs[key] = value
            }

            book.title = title
            book.cover = cover
            book.refs = refs
            book.parents = file.parents
            book.imgSrcs = Object.values(imgSrcs)
          }

          if (file.mimeType === 'application/json') {
            const text = await blob.text()
            const jsonData: Metadata = JSON.parse(text)

            bookContent.metadata = jsonData
          }

          if (cancelled) return
        }

        await Db.addBook(db, {
          id: bookId,
          chapters: bookContent.chapters,
          blobs: bookContent.blobs,
          metadata: bookContent.metadata,
        })

        localBooksCache.set(bookId, book)
      }

      if (!cancelled) {
        setBooks(localBooksCache)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [accessToken, db])

  return [books, setBooks]
}

function replaceImgWithDummyImg(
  html: string,
  imgSrcs: Record<string, string>,
): string {
  const parser = new DOMParser()
  let updatedHtml = ''
  let htmlDom = parser.parseFromString(html, 'application/xhtml+xml')

  // check if XHTML parsing failed
  const parserError = htmlDom.querySelector('parsererror')

  if (parserError) {
    htmlDom = parser.parseFromString(html, 'text/html')
  }

  const imgs = htmlDom.querySelectorAll('img')
  for (const img of imgs) {
    const src = img.getAttribute('src')
    if (!src) continue

    const key = src.replace(/^(\.\.\/)+/, '')
    const dummyUrl = GenerateDummyImage(imgSrcs[key])

    img.setAttribute('src', dummyUrl)
  }

  if (htmlDom.contentType === 'application/xhtml+xml') {
    updatedHtml = new XMLSerializer().serializeToString(htmlDom)
  } else {
    updatedHtml = htmlDom.documentElement.outerHTML
  }

  return updatedHtml
}
