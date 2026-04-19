const DEV_FALLBACK_API_BASE = "http://localhost:9000";

const normalizeApiBaseUrl = (rawValue) => {
  const value = (rawValue || "").trim();
  if (!value) return "";

  if (value.startsWith("ttps://")) return `h${value}`.replace(/\/+$/, "");
  if (value.startsWith("http//")) return value.replace("http//", "http://").replace(/\/+$/, "");
  if (value.startsWith("https//")) return value.replace("https//", "https://").replace(/\/+$/, "");
  if (value.startsWith("//")) return `https:${value}`.replace(/\/+$/, "");

  if (!/^https?:\/\//i.test(value)) {
    return `https://${value}`.replace(/\/+$/, "");
  }

  return value.replace(/\/+$/, "");
};

export const getApiBaseUrl = () => {
  const raw = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || "";
  const normalized = normalizeApiBaseUrl(raw);

  if (normalized) return normalized;
  return import.meta.env.DEV ? DEV_FALLBACK_API_BASE : "";
};

export const buildApiUrl = (path = "") => {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!base) return normalizedPath;
  return `${base}${normalizedPath}`;
};
