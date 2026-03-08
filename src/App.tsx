import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Home from "./pages/home";
import OAuth2Callback from "./pages/oauth2callback";

function App() {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/oauth2" element={<OAuth2Callback />} />
      </Routes>
    </>
  );
}

export default App;
