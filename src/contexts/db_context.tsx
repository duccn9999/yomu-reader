import { createContext, useEffect, useState, type ReactNode } from "react";
import { OpenDB } from "../db/yomu_reader_db";

type DbContextType = {
  db: IDBDatabase | null;
  setDb: React.Dispatch<React.SetStateAction<IDBDatabase | null>>;
};

export const DbContext = createContext<DbContextType>({} as DbContextType);
export function DbContextProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    OpenDB().then(setDb);
  }, []);

  return (
    <DbContext.Provider value={{ db, setDb }}>{children}</DbContext.Provider>
  );
}
