export interface IEpubFile {
  package: {
    metadata: {
      "dc:language": string;
      "dc:title": string;
      "dc:creator": string;
      "dc:identifiers": string[];
      "dc:date": string;
      metas: {
        meta: string;
      };
    };
    manifest: {
      items: {
        id: string;
        href: string;
        "media-type": string;
      }[];
    };
    spine: {
      itemrefs: {
        idref: string;
      }[];
    };
    guides: {
      references: {
        type: string;
        title: string;
        href: string;
      }[];
    };
  };
}
