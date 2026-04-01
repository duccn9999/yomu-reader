import { createContext, useState, type ReactNode } from "react";
import type { ReadingStyle } from "../models/reading_style";

type ThemeContextType = {
  theme: ReadingStyle;
  setTheme: React.Dispatch<React.SetStateAction<ReadingStyle>>;
};
const DefaultValue: ReadingStyle = {
  id: 0,
  txtColor: "#000000",
  bgColor: "#d29cea",
  txtAlign: "justify",
  margin: "0",
  padding: "0 1.5rem 0 1.5rem",
  font: "Noto Serif JP",
  fontSize: "14px",
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultValue,
  setTheme: () => {}, // dummy function (required)
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ReadingStyle>(DefaultValue);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
