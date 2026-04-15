import { createContext, useState, type ReactNode } from "react";
import type { IScreenContext } from "../interfaces/IScreenContext";

const DefaultValue: IScreenContext = {
  screen: 0,
  setScreen: () => {},
};
export const ScreenContext = createContext<IScreenContext>(DefaultValue);
export function ScreenProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<number>(DefaultValue.screen);
  return (
    <ScreenContext.Provider value={{ screen, setScreen }}>
      {children}
    </ScreenContext.Provider>
  );
}
