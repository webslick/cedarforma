import { Routes, Route } from "react-router-dom";

import PublicApp from "./apps/public/PublicApp";
import AdminApp from "./apps/admin/AdminApp";

function App() {
  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<PublicApp />} />
    </Routes>
  );
}

export default App;