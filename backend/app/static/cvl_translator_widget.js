/**
 * CVL Website Translation Widget
 * Embeddable script for translating any web page into Indian languages.
 */
(function () {
  // Locate script element even if loaded asynchronously or deferred
  const currentScript =
    document.currentScript ||
    document.querySelector("script[src*='cvl_translator_widget']");

  const API_URL =
    currentScript?.getAttribute("data-api-url") ||
    window.CVL_TRANSLATOR_API_URL ||
    window.location.origin;

  const API_KEY =
    currentScript?.getAttribute("data-api-key") ||
    window.CVL_TRANSLATOR_API_KEY ||
    "";

  const LANGUAGES = [
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

  let originalTextsMap = new Map(); // Store original English text for reset

  function getStoredLanguage() {
    try {
      return localStorage.getItem("cvl_website_lang") || "eng_Latn";
    } catch (e) {
      return "eng_Latn";
    }
  }

  function setStoredLanguage(lang) {
    try {
      localStorage.setItem("cvl_website_lang", lang);
    } catch (e) {}
  }

  function getLocalTranslationCache(lang) {
    try {
      const cached = localStorage.getItem(`cvl_cache_${lang}`);
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalTranslationCache(lang, cacheObj) {
    try {
      localStorage.setItem(`cvl_cache_${lang}`, JSON.stringify(cacheObj));
    } catch (e) {}
  }

  // Create UI Widget
  function createWidget() {
    // Guard against duplicate widget creation
    if (document.getElementById("cvl-translator-widget")) {
      return;
    }

    const container = document.createElement("div");
    container.id = "cvl-translator-widget";
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const select = document.createElement("select");
    select.id = "cvl-lang-select";
    select.style.cssText = `
      padding: 10px 16px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(15, 23, 42, 0.9);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
      outline: none;
      transition: all 0.3s ease;
    `;

    LANGUAGES.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = `${lang.nativeName} (${lang.name})`;
      select.appendChild(option);
    });

    const currentLang = getStoredLanguage();
    select.value = currentLang;

    select.addEventListener("change", (e) => {
      const targetLang = e.target.value;
      setStoredLanguage(targetLang);
      translatePage(targetLang);
    });

    container.appendChild(select);
    document.body.appendChild(container);
  }

  // Collect text nodes from DOM
  function getTextNodes(node, textNodes = []) {
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue.trim();
      if (val.length > 0 && !/^\d+$/.test(val) && !/^[^\w\s]+$/.test(val)) {
        textNodes.push(node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      if (
        tag !== "script" &&
        tag !== "style" &&
        tag !== "noscript" &&
        tag !== "iframe" &&
        tag !== "code" &&
        tag !== "textarea" &&
        tag !== "input" &&
        node.id !== "cvl-translator-widget"
      ) {
        for (let child of node.childNodes) {
          getTextNodes(child, textNodes);
        }
      }
    }
    return textNodes;
  }

  // Translate page content
  async function translatePage(targetLang) {
    const textNodes = getTextNodes(document.body);

    // Save originals if not saved
    textNodes.forEach((node) => {
      if (!originalTextsMap.has(node)) {
        originalTextsMap.set(node, node.nodeValue);
      }
    });

    // If English, restore originals
    if (targetLang === "eng_Latn") {
      textNodes.forEach((node) => {
        if (originalTextsMap.has(node)) {
          node.nodeValue = originalTextsMap.get(node);
        }
      });
      return;
    }

    const uniqueTexts = [];
    const textToNodes = new Map();

    textNodes.forEach((node) => {
      const origText = originalTextsMap.get(node) || node.nodeValue;
      const trimmed = origText.trim();
      if (trimmed) {
        if (!textToNodes.has(trimmed)) {
          textToNodes.set(trimmed, []);
          uniqueTexts.push(trimmed);
        }
        textToNodes.get(trimmed).push(node);
      }
    });

    if (uniqueTexts.length === 0) return;

    // Show loading indicator in select
    const select = document.getElementById("cvl-lang-select");
    if (select) select.disabled = true;

    try {
      const localCache = getLocalTranslationCache(targetLang);
      const translationsMap = new Map();
      const textsToFetch = [];

      uniqueTexts.forEach((orig) => {
        if (localCache[orig]) {
          translationsMap.set(orig, localCache[orig]);
        } else {
          textsToFetch.push(orig);
        }
      });

      if (textsToFetch.length > 0) {
        try {
          const staticRes = await fetch(`/translations/${targetLang}.json`);
          if (staticRes.ok) {
            const staticDict = await staticRes.json();
            const stillMissing = [];
            textsToFetch.forEach((orig) => {
              if (staticDict[orig]) {
                translationsMap.set(orig, staticDict[orig]);
                localCache[orig] = staticDict[orig];
              } else {
                stillMissing.push(orig);
              }
            });
            textsToFetch.length = 0;
            textsToFetch.push(...stillMissing);
          }
        } catch (_) {}
      }

      if (textsToFetch.length > 0 && API_URL) {
        const BATCH_SIZE = 50;

        for (let i = 0; i < textsToFetch.length; i += BATCH_SIZE) {
          const batch = textsToFetch.slice(i, i + BATCH_SIZE);

          try {
            const response = await fetch(`${API_URL}/translate-batch`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(API_KEY ? { "X-API-Key": API_KEY } : {})
              },
              body: JSON.stringify({
                texts: batch,
                source_lang: "eng_Latn",
                target_lang: targetLang
              })
            });

            if (response.ok) {
              const data = await response.json();
              const results = data.translations || [];

              batch.forEach((orig, idx) => {
                if (results[idx] !== undefined) {
                  translationsMap.set(orig, results[idx]);
                  localCache[orig] = results[idx];
                }
              });
            }
          } catch (fetchErr) {
            console.warn("[CVL Translator] API fetch error (backend server may be closed). Using local cache.", fetchErr);
          }
        }
      }

      saveLocalTranslationCache(targetLang, localCache);

      // Apply translations to DOM
      textToNodes.forEach((nodes, origText) => {
        const translated = translationsMap.get(origText);
        if (translated) {
          nodes.forEach((node) => {
            node.nodeValue = translated;
          });
        }
      });
    } catch (err) {
      console.error("CVL Translation error:", err);
    } finally {
      if (select) select.disabled = false;
    }
  }

  // Initialize widget safely once
  function init() {
    createWidget();
    const storedLang = getStoredLanguage();
    if (storedLang && storedLang !== "eng_Latn") {
      translatePage(storedLang);
    }
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    init();
  } else {
    window.addEventListener("DOMContentLoaded", init);
  }
})();
