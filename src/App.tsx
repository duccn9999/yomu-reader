import { Route, Routes } from "react-router-dom";
import "./App.css";
import OAuth2Callback from "./pages/oauth2_callback";
import { Manage } from "./pages/home";
import { ThemeContext, ThemeProvider } from "./contexts/theme_context";
import type { ReadingStyle } from "./models/reading_style";
import { getTheme } from "./db/yomu_reader_db";
import { useContext, useEffect } from "react";
import { DbContext, DbContextProvider } from "./contexts/db_context";

function App() {
  const { db } = useContext(DbContext);
  const { setTheme } = useContext(ThemeContext);
  useEffect(() => {
    async function fetchTheme() {
      if (db) {
        const theme = await getTheme(db, 1);
        if (theme) {
          setTheme(theme as ReadingStyle);
        }
      }
    }
    fetchTheme();
  }, [db]);
  return (
    <>
      {/* Routes */}
      <DbContextProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/" element={<Manage />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Routes>
        </ThemeProvider>
      </DbContextProvider>
    </>
  );
}

export default App;
