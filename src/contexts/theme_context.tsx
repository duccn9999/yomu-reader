import { useState, type ReactNode } from 'react'
import type { Theme } from '../models/theme'
import { ThemeContext } from './providers/theme_context_provider'
import { DefaultValues } from '../utils/default_values'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme & { id: number }>(
    DefaultValues.lightTheme as Theme & { id: number },
  )
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
