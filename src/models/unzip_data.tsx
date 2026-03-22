import type { IUnzipData } from "../interfaces/IUnzipData";
export class UnzipData implements IUnzipData {
  data: {
    fileName: string;
    isDirectory: boolean;
    content: Blob | string | null;
  }[];
  constructor(
    data: {
      fileName: string;
      isDirectory: boolean;
      content: Blob | string | null;
    }[],
  ) {
    this.data = data;
  }
}
