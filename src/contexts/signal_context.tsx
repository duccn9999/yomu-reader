import { createContext, useState, type ReactNode } from "react";

type SignalContextType = {
  trigger: () => void;
};

export const SignalContext = createContext<SignalContextType | null>(null);

export function SignalProvider({ children }: { children: ReactNode }) {
  const [, setSignal] = useState(0);

  const trigger = () => {
    setSignal((prev) => prev + 1);
  };

  return (
    <SignalContext.Provider value={{ trigger }}>
      {children}
    </SignalContext.Provider>
  );
}
