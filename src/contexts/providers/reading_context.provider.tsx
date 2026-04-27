import { createContext } from 'react'
import type { IReadingContext } from '../../interfaces/IReadingContext'

const DefaultValue: IReadingContext = {
  id: '',
  setId: () => {},
}
export const ReadingContext = createContext<IReadingContext>(DefaultValue)
