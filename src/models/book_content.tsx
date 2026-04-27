import { Metadata } from './metadata'

export class BookContent {
  id: string
  chapters: Record<string, string>
  blobs: Record<string, Blob>
  metadata: Metadata

  constructor(
    id: string = '',
    chapters: Record<string, string> = {},
    blobs: Record<string, Blob> = {},
    metadata = {} as Metadata,
  ) {
    this.id = id
    this.chapters = chapters
    this.blobs = blobs
    this.metadata = metadata
  }
}
