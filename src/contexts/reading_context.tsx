import { useState, type ReactNode } from 'react'
import { ReadingContext } from './providers/reading_context.provider'

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | number | null>(null)
  return (
    <ReadingContext.Provider value={{ id, setId }}>
      {children}
    </ReadingContext.Provider>
  )
}
