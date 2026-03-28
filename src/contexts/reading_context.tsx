import { createContext, useState, type ReactNode } from "react";
import type { IReadingContext } from "../interfaces/IReadingContext";

const DefaultValue: IReadingContext = {
  id: null,
  setId: () => {},
};
export const ReadingContext = createContext<IReadingContext>(DefaultValue);
export function ReadingProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | number | null>(null);
  return (
    <ReadingContext.Provider value={{ id, setId }}>
      {children}
    </ReadingContext.Provider>
  );
}
