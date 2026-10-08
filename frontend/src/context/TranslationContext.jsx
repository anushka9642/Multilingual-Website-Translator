import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const LANGUAGES = [
  { code: "eng_Latn", name: "English", nativeName: "English" },
  { code: "hin_Deva", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ben_Beng", name: "Bengali", nativeName: "বাংলা" },
  { code: "mar_Deva", name: "Marathi", nativeName: "मराठी" },
  { code: "tel_Telu", name: "Telugu", nativeName: "తెలుగు" },
  { code: "tam_Taml", name: "Tamil", nativeName: "தமிழ்" },
  { code: "guj_Gujr", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "urd_Arab", name: "Urdu", nativeName: "اردو" },
  { code: "kan_Knda", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ory_Orya", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "mal_Mlym", name: "Malayalam", nativeName: "മലയാളം" }
];



const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [selectedLanguage, setSelectedLanguageState] = useState(() => {
    try {
      return localStorage.getItem("cvl_selected_language") || "eng_Latn";
    } catch {
      return "eng_Latn";
    }
  });

  const setSelectedLanguage = useCallback((lang) => {
    setSelectedLanguageState(lang);
    try {
      localStorage.setItem("cvl_selected_language", lang);
    } catch (e) {
      console.warn("Could not save selected language to localStorage:", e);
    }
  }, []);

  const [translations, setTranslations] = useState({});

  const [loading, setLoading] = useState(false);

  /*
   * Translate ONE piece of text.
   */
  const translateText = useCallback(
    async (text, targetLanguage = selectedLanguage) => {
      if (!text || !text.trim()) {
        return "";
      }

      const API_KEY = import.meta.env.VITE_API_KEY || "cvl_secret_key_2026";
      const response = await fetch(
        `${API_BASE_URL}/translate`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
          },

          body: JSON.stringify({
            text: text.trim(),
            source_lang: "eng_Latn",
            target_lang: targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Translation API error ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      return data.translated_text;
    },
    [selectedLanguage]
  );

  /*
   * Translate multiple texts using the backend batch endpoint.
   */
  const translateBatch = useCallback(
    async (texts, targetLanguage = selectedLanguage) => {
      if (!texts || texts.length === 0) {
        return [];
      }

      const API_KEY = import.meta.env.VITE_API_KEY || "cvl_secret_key_2026";
      const response = await fetch(
        `${API_BASE_URL}/translate-batch`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
          },

          body: JSON.stringify({
            texts,
            source_lang: "eng_Latn",
            target_lang: targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Batch translation API error ${response.status}: ${errorText}`
        );
      }

      const data = await response.json();

      return data.translations || [];
    },
    [selectedLanguage]
  );

  /*
   * Old/general page translation helper.
   */
  const translatePage = useCallback(
    async (texts) => {
      setLoading(true);

      try {
        const result = {};

        for (const item of texts) {
          const translated = await translateText(
            item.text,
            selectedLanguage
          );

          result[item.id] = translated;
        }

        setTranslations(result);

        return result;
      } finally {
        setLoading(false);
      }
    },
    [selectedLanguage, translateText]
  );

  const value = {
  languages: LANGUAGES,

  selectedLanguage,
  setSelectedLanguage,

  translations,
  setTranslations,

  loading,
  setLoading,
  translateBatch,
  translateText,
  translatePage,
};

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error(
      "useTranslationContext must be used inside TranslationProvider"
    );
  }

  return context;
}

export function useTranslation() {
  return useTranslationContext();
}