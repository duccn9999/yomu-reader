export interface IUnzipData {
  data: {
    fileName: string;
    isDirectory: boolean;
    content: Blob | string | null;
  }[];
}
