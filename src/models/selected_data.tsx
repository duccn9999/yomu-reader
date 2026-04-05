export class SelectedData {
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
  range: Range;
  text: string;
  note: string;
  color: string;
  x: number;
  y: number;
  constructor(
    startContainer: Node,
    startOffset: number,
    endContainer: Node,
    endOffset: number,
    range: Range,
    text: string,
    note: string,
    color: string,
    x: number,
    y: number,
  ) {
    this.startContainer = startContainer;
    this.startOffset = startOffset;
    this.endContainer = endContainer;
    this.endOffset = endOffset;
    this.range = range;
    this.text = text;
    this.note = note;
    this.color = color;
    this.x = x;
    this.y = y;
  }
}
