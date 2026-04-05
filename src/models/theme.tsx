export class Theme {
  name: string;
  txtColor: string;
  bgColor: string;
  txtAlign: React.CSSProperties["textAlign"];
  margin: Margin;
  padding: Padding;
  font: string;
  fontSize?: number | undefined;
  constructor(
    name: string,
    txtColor: string,
    bgColor: string,
    txtAlign: React.CSSProperties["textAlign"],
    /* top, right, bottom, left */
    margin: Margin,
    padding: Padding,
    font: string,
    fontSize?: number | undefined,
  ) {
    this.name = name;
    this.txtColor = txtColor;
    this.bgColor = bgColor;
    this.txtAlign = txtAlign;
    this.margin = margin;
    this.padding = padding;
    this.font = font;
    this.fontSize = fontSize;
  }
}
class Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
  constructor(top: number, right: number, bottom: number, left: number) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
}
class Padding {
  top: number;
  right: number;
  bottom: number;
  left: number;
  constructor(top: number, right: number, bottom: number, left: number) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
  }
}
