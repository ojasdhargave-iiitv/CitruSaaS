import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Builder from "./pages/generationpage";
import Preview from "./pages/Preview";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
