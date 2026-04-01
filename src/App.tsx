import { Route, Routes } from "react-router-dom";
import "./App.css";
import OAuth2Callback from "./pages/oauth2_callback";
import Setting from "./pages/setting";
import { Manage } from "./pages/home";
import { ThemeContext, ThemeProvider } from "./contexts/theme_context";
import type { ReadingStyle } from "./models/reading_style";
import { getTheme, OpenDB } from "./db/yomu_reader_db";
import { useContext, useEffect, useState } from "react";

function App() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const { setTheme } = useContext(ThemeContext);

  useEffect(() => {
    async function init() {
      const db = await OpenDB();
      setDb(db);
    }
    init();
  }, []);
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
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<Manage />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
