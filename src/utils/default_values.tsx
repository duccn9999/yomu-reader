import type { Theme } from "../models/theme";

export class DefaultValues {
  //generate 1 dark and 1 light theme
  static lightTheme: Theme = {
    id: 1,
    name: "Light",
    txtColor: "#000000",
    bgColor: "#FFFFFF",
    txtAlign: "justify",
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding: {
      top: 0,
      right: 24,
      bottom: 0,
      left: 24,
    },
    font: "Noto Serif JP",
    fontSize: 16,
  };
  static darkTheme: Theme = {
    id: 2,
    name: "Dark",
    txtColor: "#FFFFFF",
    bgColor: "#000000",
    txtAlign: "justify",
    margin: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    padding: {
      top: 0,
      right: 24,
      bottom: 0,
      left: 24,
    },
    font: "Noto Serif JP",
    fontSize: 16,
  };
}
