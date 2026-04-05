import { createContext, useState, type ReactNode } from "react";
import type { Theme } from "../models/theme";
import { DefaultValues } from "../utils/default_values";

type ThemeContextType = {
  theme: Theme & { id: number };
  setTheme: React.Dispatch<React.SetStateAction<Theme & { id: number }>>;
};
const DefaultValue = DefaultValues.lightTheme as Theme & { id: number };

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultValue,
  setTheme: () => {}, // dummy function (required)
});
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme & { id: number }>(DefaultValue);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
