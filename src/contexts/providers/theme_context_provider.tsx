import { createContext } from 'react'
import type { Theme } from '../../models/theme'
import { DefaultValues } from '../../utils/default_values'

type ThemeContextType = {
  theme: Theme & { id: number }
  setTheme: React.Dispatch<React.SetStateAction<Theme & { id: number }>>
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: DefaultValues.lightTheme as Theme & { id: number },
  setTheme: () => {}, // dummy function (required)
})
