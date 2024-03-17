import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Component from "./pages/Component";
import PdfToSummary from "./pages/PdfToSummary";
import Mindmap from "./pages/Mindmap";
import Questionaire from "./pages/Questionaire";
import GeminiProVision from "./pages/GeminiProVision";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Component />} />
        <Route path="/pdf-to-summary" element={<PdfToSummary />} />
        <Route path="/mindmap" element={<Mindmap />} />
        <Route path="/questionaire" element={<Questionaire />} />
        <Route path="/GeminiProVision" element={<GeminiProVision />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
