import { Route, Routes } from 'react-router-dom'
import './App.css'
import OAuth2Callback from './pages/oauth2_callback'
import { Manage } from './pages/home'
import type { Theme } from './models/theme'
import { useContext, useEffect } from 'react'
import { ScreenProvider } from './contexts/screen_context'
import { SignalProvider } from './contexts/signal_context'
import { DbContext } from './contexts/providers/db_context_provider'
import { ThemeContext } from './contexts/providers/theme_context_provider'
import { DbContextProvider } from './contexts/db_context'
import { ThemeProvider } from './contexts/theme_context'
import { Db } from './db/yomu_reader_db'

function App() {
  const { db } = useContext(DbContext)
  const { setTheme } = useContext(ThemeContext)
  useEffect(() => {
    async function fetchTheme() {
      if (db) {
        const theme = await Db.getTheme(db, 1)
        if (theme) {
          setTheme(theme as Theme & { id: number })
        }
      }
    }
    fetchTheme()
  }, [db])
  return (
    <>
      {/* Routes */}
      <SignalProvider>
        <DbContextProvider>
          <ScreenProvider>
            <ThemeProvider>
              <Routes>
                <Route path='/' element={<Manage />} />
                <Route path='/oauth2/callback' element={<OAuth2Callback />} />
                <Route path='*' element={<div>404 Not Found</div>} />
              </Routes>
            </ThemeProvider>
          </ScreenProvider>
        </DbContextProvider>
      </SignalProvider>
    </>
  )
}

export default App
