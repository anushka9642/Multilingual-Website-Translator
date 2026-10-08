const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";


export async function translateText({
  text,
  sourceLang,
  targetLang,
}) {

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
        text: text,
        source_lang: sourceLang,
        target_lang: targetLang,
      }),
    }
  );


  if (!response.ok) {

    const errorText = await response.text();

    throw new Error(
      `Translation API error: ${response.status} ${errorText}`
    );
  }


  return await response.json();
}