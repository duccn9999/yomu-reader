import { Route, Routes } from "react-router-dom";
import "./App.css";
import OAuth2Callback from "./pages/oauth2_callback";
import Manage from "./pages/home";

function App() {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Manage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
      </Routes>
    </>
  );
}

export default App;
