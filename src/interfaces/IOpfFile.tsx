export interface IOpfFile {
  package: {
    metadata: {
      'dc:language': string
      'dc:title': string
      'dc:creator': string
      'dc:identifier': string[]
      'dc:date': string
      meta:
        | {
            '@_name': string
            '@_content': string
          }
        | {
            '@_name': string
            '@_content': string
          }[]
    }
    manifest: {
      item: {
        '@_id': string
        '@_href': string
        '@_media-type': string
      }[]
    }
    spine: {
      itemref: {
        idref: string
      }[]
    }
    guide: {
      reference: {
        type: string
        title: string
        href: string
      }[]
    }
  }
}
