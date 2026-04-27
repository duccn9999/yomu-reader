// DbContext.ts — context only
import { createContext } from 'react'

type DbContextType = {
  db: IDBDatabase | null
  setDb: React.Dispatch<React.SetStateAction<IDBDatabase | null>>
}

export const DbContext = createContext<DbContextType>({} as DbContextType)
