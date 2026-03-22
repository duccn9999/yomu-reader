export class EpubFile {
  "?xml": {
    "@_version": string;
    "@_encoding": string;
  };
  "package": {
    "@_version": string;
    "@_unique-identifier": string;
    metadata: {
      language: string;
      title: string;
      creator: {
        "#text": string;
        "@_file-as": string;
        "@_role": string;
      };
      contributor: {
        "#text": string;
        "@_role": string;
      };
      identifier: {
        "#text": string;
        "@_id"?: string;
        "@_scheme": string;
      }[];
      "dc:date": string;
      metas: {
        meta: string;
      };
    };
    manifest: {
      item: {
        "@_id": string;
        "@_href": string;
        "@_media-type": string;
      }[];
    };
    spine: {
      itemref: {
        "@_idref": string;
      }[];
      "@_toc": string;
    };
    guides: {
      references: {
        "@_type": string;
        "@_title": string;
        "@_href": string;
      }[];
    };
  };
  constructor(epubFile: EpubFile) {
    this["?xml"] = epubFile["?xml"];
    this.package = epubFile.package;
  }
}
