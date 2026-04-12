export class SelectedData {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
  text: string;
  note: string;
  color: string;
  constructor(
    startOffset: number,
    endOffset: number,
    startPath: number[],
    endPath: number[],
    text: string,
    note: string,
    color: string,
  ) {
    this.startOffset = startOffset;
    this.endOffset = endOffset;
    this.startPath = startPath;
    this.endPath = endPath;
    this.text = text;
    this.note = note;
    this.color = color;
  }
}
