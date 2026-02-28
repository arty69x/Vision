export const DEFAULT_GEMINI_API_KEY = "AIzaSyAuV8sX754rVSm0609UfP4oeUlu8LSDt1k";

const STORAGE_KEY = "custom_gemini_api_key";

export const getSyncedGeminiKey = () => {
  if (typeof window === "undefined") {
    return DEFAULT_GEMINI_API_KEY;
  }

  const saved = localStorage.getItem(STORAGE_KEY)?.trim();
  return saved || DEFAULT_GEMINI_API_KEY;
};

export const setSyncedGeminiKey = (apiKey: string) => {
  const nextKey = apiKey.trim() || DEFAULT_GEMINI_API_KEY;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, nextKey);
    window.dispatchEvent(new CustomEvent("gemini-key-updated", { detail: nextKey }));
  }

  process.env.API_KEY = nextKey;
  return nextKey;
};

