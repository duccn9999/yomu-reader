import type { IReadingStyle } from "../interfaces/IReadingStyle";

export class ReadingStyle implements IReadingStyle {
  id: number;
  txtColor: string;
  bgColor: string;
  txtAlign: React.CSSProperties["textAlign"];
  margin: string;
  padding: string;
  font: string;
  fontSize?: number | undefined;
  constructor(
    id: number,
    txtColor: string,
    bgColor: string,
    txtAlign: React.CSSProperties["textAlign"],
    margin: string,
    padding: string,
    font: string,
    fontSize?: number | undefined,
  ) {
    this.id = id;
    this.txtColor = txtColor;
    this.bgColor = bgColor;
    this.txtAlign = txtAlign;
    this.margin = margin;
    this.padding = padding;
    this.font = font;
    this.fontSize = fontSize;
  }
}
