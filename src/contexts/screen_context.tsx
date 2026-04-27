import { useState, type ReactNode } from 'react'
import {
  ScreenContext,
  DefaultValue,
} from './providers/screen_context_provider'

export function ScreenProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<number>(DefaultValue.screen)
  return (
    <ScreenContext.Provider value={{ screen, setScreen }}>
      {children}
    </ScreenContext.Provider>
  )
}
