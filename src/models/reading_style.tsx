import type { IReadingStyle } from "../interfaces/IReadingStyle";

export class ReadingStyle implements IReadingStyle {
  mode: number;
  txtColor: string;
  bgColor: string;
  txtAlign: React.CSSProperties["textAlign"];
  margin: string;
  padding: string;
  font: string;
  fontSize?: string | undefined;
  constructor() {
    this.mode = 0; // 0: continuous, 1: paged
    this.txtColor = "#000000";
    this.bgColor = "#d29cea";
    this.txtAlign = "justify";
    this.margin = "0";
    this.padding = "0 1.5rem 0 1.5rem";
    this.font = `"Noto Serif JP", "Noto Sans JP", serif`;
    this.fontSize = "14px";
  }
}
