import { Route, Routes } from "react-router-dom";
import "./App.css";
import OAuth2Callback from "./pages/oauth2_callback";
import Manage from "./pages/home";
import Setting from "./pages/setting";

function App() {
  return (
    <>
      {/* Routes */}
      <Routes>
        <Route path="/" element={<Manage />} />
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </>
  );
}

export default App;
