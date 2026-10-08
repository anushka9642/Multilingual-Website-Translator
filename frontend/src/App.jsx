import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Management from "./pages/Management.jsx";
import Contact from "./pages/Contact.jsx";

import WebsiteTranslator from "./components/WebsiteTranslator.jsx";

export default function App() {
  const [theme, setTheme] = useState("light");
  const [fontScale, setFontScale] = useState(1);

  return (
    <div
      data-theme={theme}
      style={{
        fontSize: `${fontScale}rem`,
      }}
    >
      <Header
        theme={theme}
        setTheme={setTheme}
        fontScale={fontScale}
        setFontScale={setFontScale}
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/management" element={<Management />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>

      <Footer />

      {/* Auto-translator component for location route & language changes */}
      <WebsiteTranslator />
    </div>
  );
}