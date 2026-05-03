import type { MetadataBody } from "./metadata_body";

export class Metadata {
  metadataId: string;
  metadataBody: MetadataBody;
  /**
   *
   */
  constructor(metadataId: string, metadataBody: MetadataBody) {
    ((this.metadataId = metadataId), (this.metadataBody = metadataBody));
  }
}
