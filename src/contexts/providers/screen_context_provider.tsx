import { createContext } from 'react'
import type { IScreenContext } from '../../interfaces/IScreenContext'

export const DefaultValue: IScreenContext = {
  screen: 0,
  setScreen: () => {},
}
export const ScreenContext = createContext<IScreenContext>(DefaultValue)
