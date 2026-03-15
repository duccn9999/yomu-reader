import type { IUnzipStructure } from "../interfaces/IUnzipStructure";
export class UnzipStructure implements IUnzipStructure {
  structure: {
    fileName: string;
    isDirectory: boolean;
  }[];
  constructor(
    structure: {
      fileName: string;
      isDirectory: boolean;
    }[],
  ) {
    this.structure = structure;
  }
}
