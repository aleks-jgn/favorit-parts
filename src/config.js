const DEFAULT_API_BASE_URL = '/api';
const REQUEST_TIMEOUT_MS = 15_000;

/** Настройки приложения. Значения VITE_* подставляются при сборке из .env-файлов. */
export const config = Object.freeze({
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, ''),
  apiKey: import.meta.env.VITE_FAVORIT_API_KEY || '',
  requestTimeoutMs: REQUEST_TIMEOUT_MS,
});
