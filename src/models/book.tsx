export class Book {
  title: string
  cover: Blob | null
  parents?: string[]
  refs: { idref: string }[]
  imgSrcs: string[]
  constructor(
    title: string = '',
    cover: Blob | null = null,
    parents: string[] = [],
    refs: { idref: string }[] = [],
    imgSrcs: string[] = [],
  ) {
    this.title = title
    this.cover = cover
    this.parents = parents
    this.refs = refs
    this.imgSrcs = imgSrcs
  }
}
