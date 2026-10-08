import React, { useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslationContext } from "../context/TranslationContext.jsx";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "INPUT",
  "TEXTAREA",
  "SELECT",
  "OPTION",
  "CODE",
  "PRE",
]);

/*
 * ---------------------------------------------------------
 * Check whether a text node should be translated.
 * ---------------------------------------------------------
 */
function shouldSkipText(text) {
  const value = text.trim();

  if (!value) {
    return true;
  }

  /*
   * Pure numbers / numeric symbols.
   *
   * Examples:
   * 1
   * 2
   * 9
   * 01
   * 24×7
   * 100%
   * 1-2
   */
  if (/^[\d\s.,:+\-/%×xX()]+$/u.test(value)) {
    return true;
  }

  /*
   * Only punctuation/symbols.
   */
  if (!/\p{L}/u.test(value)) {
    return true;
  }

  /*
   * Very short text that contains no meaningful
   * alphabetic content.
   */
  if (value.length < 2) {
    return true;
  }

  return false;
}

export default function WebsiteTranslator() {
  const {
    selectedLanguage,
    loading,
    setLoading,
  } = useTranslationContext();

  const location = useLocation();

  // --------------------------------------------------
  // Restore all text nodes to original English
  // --------------------------------------------------

  const restoreEnglish = useCallback(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;

    while ((node = walker.nextNode())) {
      if (node.__originalText !== undefined) {
        if (!node.isConnected) {
          continue;
        }

        try {
          node.nodeValue = node.__originalText;
        } catch (_) {
          // Node may have been detached by React.
        }
      }
    }

    console.log("Website restored to English.");
  }, []);

  // --------------------------------------------------
  // Collect translatable text nodes
  // --------------------------------------------------

  const getTextNodes = useCallback(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodes = [];

    let node;

    while ((node = walker.nextNode())) {
      const parent = node.parentElement;

      if (!parent) {
        continue;
      }

      // Skip technical HTML elements
      if (SKIP_TAGS.has(parent.tagName)) {
        continue;
      }

      /*
       * Skip translation controls and website controls.
       */
      if (
        parent.closest(".ars-language-selector") ||
        parent.closest(".ars-font-btn") ||
        parent.closest(".ars-theme-btn") ||
        parent.closest("#cvl-translator-widget")
      ) {
        continue;
      }

      /*
       * Save the original English text ONLY ONCE.
       *
       * This is extremely important.
       *
       * When the user changes:
       *
       * English → Marathi → Kashmiri
       *
       * we always translate from the original English,
       * NOT from Marathi.
       */
      if (node.__originalText === undefined) {
        node.__originalText = node.nodeValue;
      }

      const originalText =
        node.__originalText.trim();

      /*
       * Ignore empty / numeric / punctuation text.
       */
      if (shouldSkipText(originalText)) {
        continue;
      }

      nodes.push(node);
    }

    return nodes;
  }, []);

  // --------------------------------------------------
  // Translate complete website
  // --------------------------------------------------

  const translateWebsite = useCallback(
    async (targetLang) => {
      const currentLang =
        targetLang || selectedLanguage;

      // English = restore original
      if (
        !currentLang ||
        currentLang === "eng_Latn"
      ) {
        restoreEnglish();
        return;
      }

      const nodes = getTextNodes();

      console.log(
        `Found ${nodes.length} translatable text nodes`
      );

      if (nodes.length === 0) {
        return;
      }

      /*
       * ------------------------------------------------
       * Create unique text list
       * ------------------------------------------------
       */

      const uniqueTextsSet = new Set();

      const nodeMap = [];

      nodes.forEach((node) => {
        const originalText =
          node.__originalText.trim();

        if (!originalText) {
          return;
        }

        nodeMap.push({
          node,
          originalText,
        });

        uniqueTextsSet.add(originalText);
      });

      const uniqueTexts =
        Array.from(uniqueTextsSet);

      console.log(
        `Unique texts to translate: ${uniqueTexts.length}`
      );

      if (uniqueTexts.length === 0) {
        return;
      }

      setLoading(true);

      try {
        /*
         * ------------------------------------------------
         * Load browser local cache
         * ------------------------------------------------
         */
        let localCache = {};
        try {
          const cachedData = localStorage.getItem(`cvl_cache_${currentLang}`);
          if (cachedData) {
            localCache = JSON.parse(cachedData);
          }
        } catch (_) {}

        const translationMap = {};
        const missingTexts = [];

        const findInDict = (dict, t) => {
          if (!dict || !t) return null;
          const trimmed = t.trim();
          if (dict[t]) return dict[t];
          if (dict[trimmed]) return dict[trimmed];
          const normalized = trimmed.replace(/\s+/g, " ");
          if (dict[normalized]) return dict[normalized];
          const stripped = normalized.replace(/[,.]$/, "").trim();
          if (dict[stripped]) return dict[stripped];
          return null;
        };

        uniqueTexts.forEach((text) => {
          const cachedVal = findInDict(localCache, text);
          if (cachedVal) {
            translationMap[text] = cachedVal;
          } else {
            missingTexts.push(text);
          }
        });

        /*
         * ------------------------------------------------
         * Load static pre-translated JSON file if available
         * ------------------------------------------------
         */
        if (missingTexts.length > 0) {
          try {
            const staticRes = await fetch(`/translations/${currentLang}.json`);
            if (staticRes.ok) {
              const staticDict = await staticRes.json();
              const remainingMissing = [];
              missingTexts.forEach((text) => {
                const foundVal = findInDict(staticDict, text);
                if (foundVal) {
                  translationMap[text] = foundVal;
                  localCache[text] = foundVal;
                } else {
                  remainingMissing.push(text);
                }
              });
              missingTexts.length = 0;
              missingTexts.push(...remainingMissing);
            }
          } catch (_) {}
        }

        /*
         * ------------------------------------------------
         * Fetch missing translations if server is running
         * ------------------------------------------------
         */
        if (missingTexts.length > 0) {
          const API_KEY =
            import.meta.env.VITE_API_KEY ||
            "cvl_secret_key_2026";

          console.log(
            `Fetching batch request for ${missingTexts.length} missing texts`
          );

          try {
            const response = await fetch(
              `${API_URL}/translate-batch`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-API-Key": API_KEY,
                },
                body: JSON.stringify({
                  texts: missingTexts,
                  source_lang: "eng_Latn",
                  target_lang: currentLang,
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (Array.isArray(data.translations)) {
                missingTexts.forEach((text, index) => {
                  const translated = data.translations[index] || text;
                  translationMap[text] = translated;
                  localCache[text] = translated;
                });
              }
            } else {
              console.warn(
                `Translation API returned status ${response.status}. Falling back to browser cache.`
              );
            }
          } catch (fetchErr) {
            console.warn(
              "Backend translation server unreachable (server may be closed). Using browser local cache:",
              fetchErr
            );
          }
        }

        try {
          localStorage.setItem(
            `cvl_cache_${currentLang}`,
            JSON.stringify(localCache)
          );
        } catch (_) {}

        /*
         * ------------------------------------------------
         * Put translations back into webpage
         * ------------------------------------------------
         */

        let translatedNodeCount = 0;

        nodeMap.forEach(
          ({ node, originalText }) => {
            /*
             * React may have removed this node.
             */
            if (!node.isConnected) {
              return;
            }

            const translatedText =
              translationMap[
                originalText
              ];

            if (!translatedText) {
              return;
            }

            try {
              /*
               * Preserve whitespace around
               * the original text.
               */
              const originalValue =
                node.__originalText;

              const leadingWhitespace =
                originalValue.match(
                  /^\s*/
                )?.[0] || "";

              const trailingWhitespace =
                originalValue.match(
                  /\s*$/
                )?.[0] || "";

              node.nodeValue =
                leadingWhitespace +
                translatedText +
                trailingWhitespace;

              translatedNodeCount++;
            } catch (_) {
              // Node was detached during React update.
            }
          }
        );

        console.log(
          `Translated ${translatedNodeCount} DOM text nodes.`
        );

        console.log(
          `Translation completed: ${currentLang}`
        );

      } catch (error) {
        console.error(
          "Website translation failed:",
          error
        );

      } finally {
        setLoading(false);
      }
    },
    [
      selectedLanguage,
      getTextNodes,
      restoreEnglish,
      setLoading,
    ]
  );

  // --------------------------------------------------
  // Automatically translate when:
  //
  // 1. Language changes
  // 2. Route changes
  // --------------------------------------------------

  useEffect(() => {
    if (
      selectedLanguage ===
      "eng_Latn"
    ) {
      restoreEnglish();
      return;
    }

    /*
     * Wait for React to render the new page
     * before collecting text nodes.
     */
    const timer = setTimeout(() => {
      translateWebsite(
        selectedLanguage
      );
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [
    selectedLanguage,
    location.pathname,
    translateWebsite,
    restoreEnglish,
  ]);

  /*
   * This component does not render
   * a button.
   *
   * Translation happens automatically
   * when language changes.
   */
  return null;
}