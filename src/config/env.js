const DEFAULT_ORIGIN = "http://localhost:5000";

const normalizeUrl = (value) => String(value || "").replace(/\/$/, "");

const toApiBaseUrl = (value) => {
  const normalized = normalizeUrl(value);
  if (!normalized) return `${DEFAULT_ORIGIN}/api`;
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
};

const apiBaseUrl = toApiBaseUrl(import.meta.env.VITE_API_URL);

/** Base URL for API requests, e.g. http://localhost:5000/api */
export const API_BASE_URL = apiBaseUrl;

/** Origin for static uploads (same host as API, without /api suffix) */
export const FILE_BASE_URL = apiBaseUrl.replace(/\/api$/, "") || DEFAULT_ORIGIN;
