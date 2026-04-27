// DbContextProvider.tsx — provider only
import { useEffect, useState, type ReactNode } from 'react'
import { Db } from '../db/yomu_reader_db'
import { DbContext } from './providers/db_context_provider'

export function DbContextProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<IDBDatabase | null>(null)

  useEffect(() => {
    Db.OpenDB().then(setDb)
  }, [])

  return (
    <DbContext.Provider value={{ db, setDb }}>{children}</DbContext.Provider>
  )
}
