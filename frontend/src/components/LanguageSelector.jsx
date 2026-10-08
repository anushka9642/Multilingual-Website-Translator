import React from "react";
import {
  LANGUAGES,
  useTranslation,
} from "../context/TranslationContext.jsx";

export default function LanguageSelector() {
  const {
    selectedLanguage,
    setSelectedLanguage,
    loading,
  } = useTranslation();

  function handleLanguageChange(e) {
    const language = e.target.value;
    setSelectedLanguage(language);
  }

  return (
    <div className="language-selector">
      <select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        disabled={loading}
        aria-label="Select language"
      >
        {LANGUAGES.map((language) => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.nativeName} ({language.name})
          </option>
        ))}
      </select>

      {loading && (
        <span className="translation-loading">
          Translating...
        </span>
      )}
    </div>
  );
}